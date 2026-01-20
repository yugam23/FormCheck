"""
FormCheck Backend - AI Fitness Trainer
FastAPI application with WebSocket support for real-time pose estimation.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pose_estimator import PoseEstimator
from form_analyzer import FormAnalyzer

app = FastAPI(title="FormCheck API", version="1.0.0")

# CORS configuration for React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "FormCheck Backend"}


@app.websocket("/ws/pose")
async def websocket_pose_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time pose estimation.
    Receives video frames from frontend, processes them, and sends back pose data.
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    pose_estimator = PoseEstimator()
    form_analyzer = FormAnalyzer()
    
    try:
        while True:
            # Receive frame data from frontend
            # Expecting raw base64 string or JSON with "image" key?
            # Let's assume the frontend sends a JSON with { type: 'frame', data: 'base64...' }
            # or just the raw base64 string for simplicity? 
            # Plan says "Frame data", implementation usually easier with some metadata.
            # Let's try to parse as JSON first.
            
            message_text = await websocket.receive_text()
            
            # Simple check if it's likely just base64 or JSON
            # Ideally frontend sends JSON: {"image": "..."}
            # But let's handle the raw base64 case if needed, or enforce JSON.
            # We'll assume usage of JSON wrapper for extensibility.
            import json
            try:
                payload = json.loads(message_text)
                image_data = payload.get("data")
            except json.JSONDecodeError:
                # Fallback if raw string
                image_data = message_text

            if not image_data:
                continue

            # Process frame with MediaPipe
            results = pose_estimator.process_frame(image_data)
            
            if results and results.pose_landmarks:
                landmarks = pose_estimator.get_landmarks_dict(results)
                
                # Analyze form
                feedback, rep_data = form_analyzer.analyze_pushup(landmarks)
                
                # Send results back
                response = {
                    "landmarks": landmarks,
                    "feedback": feedback.dict() if feedback else None,
                    "rep_data": rep_data.dict() if rep_data else None
                }
                
                await websocket.send_json(response)
            else:
                 # No pose detected
                await websocket.send_json({
                    "landmarks": [],
                    "feedback": {"message": "No pose detected", "color": "white"},
                    "rep_data": None
                })
            
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed")
    except Exception as e:
        logger.error(f"Error in websocket loop: {e}")
        # Try to close if possible, or just break
        try:
            await websocket.close()
        except:
            pass


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
