from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
from typing import Dict, Any

from app.core.pose_detector import PoseDetector
from app.core.connection_manager import ConnectionManager
from app.engine.exercises import get_strategy
from app.database import db

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FormCheck")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Services
manager = ConnectionManager()
# detector = PoseDetector() - Moved to session scope

# Session State: WebSocket -> Dict {"strategy": ExerciseStrategy, "name": str}
active_sessions: Dict[WebSocket, Dict[str, Any]] = {}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "FormCheck API V2",
        "active_connections": len(manager.active_connections),
    }


@app.get("/api/sessions")
def get_sessions(limit: int = 10):
    """Return recent workout sessions"""
    return db.get_recent_sessions(limit)


from pydantic import BaseModel


class SessionCreate(BaseModel):
    exercise: str
    reps: int
    duration: int = 0


@app.post("/api/save-session")
def save_session(session: SessionCreate):
    """Manually save a completed session"""
    logger.info(f"Manual save: {session.exercise} - {session.reps} reps")
    db.save_session(session.exercise, session.reps, session.duration)
    return {"status": "saved"}


@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: int):
    """Delete a specific session"""
    db.delete_session(session_id)
    return {"status": "deleted", "id": session_id}


@app.delete("/api/sessions")
def delete_all_sessions():
    """Delete all sessions"""
    db.delete_all_sessions()
    return {"status": "all deleted"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    detector = PoseDetector()

    # Initialize default session
    active_sessions[websocket] = {
        "strategy": get_strategy("Pushups"),
        "name": "Pushups",
        "start_time": None,  # Could track duration
    }

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get(
                    "type", "FRAME"
                )  # Default to FRAME for backward compat

                if msg_type == "INIT":
                    # Client signaling exercise type
                    exercise_name = message.get("exercise", "Pushups")
                    active_sessions[websocket] = {
                        "strategy": get_strategy(exercise_name),
                        "name": exercise_name,
                    }
                    logger.info(f"Client initialized exercise: {exercise_name}")

                elif msg_type == "FRAME":
                    payload = message.get("payload")
                    timestamp = message.get("timestamp")

                    session = active_sessions.get(websocket)
                    if not session:
                        continue

                    strategy = session["strategy"]

                    # Run inference using centralized detector
                    # Note: PoseDetector is thread-safe for inference usually,
                    # but if we scale, we might need a pool.
                    pose_result = detector.process_frame(payload)

                    if pose_result and pose_result.landmarks:
                        # Process Logic
                        result = strategy.process(pose_result.landmarks)

                        response = {
                            "type": "RESULT",
                            "timestamp": timestamp,
                            "landmarks": [lm.dict() for lm in pose_result.landmarks],
                            "reps": result["reps"],
                            "feedback": result["feedback"],
                            "state": result["state"],
                        }
                    else:
                        response = {"type": "NO_DETECTION"}

                    await websocket.send_text(json.dumps(response))

            except json.JSONDecodeError:
                pass
            except Exception as e:
                logger.error(f"Error handling message: {e}")

    except WebSocketDisconnect:
        logger.info("Client disconnected")
        manager.disconnect(websocket)
        detector.close()

        # Save session data
        session = active_sessions.pop(websocket, None)
        if session:
            strategy = session["strategy"]
            name = session["name"]
            # Save if there was activity (reps > 0)
            if strategy.reps > 0:
                logger.info(f"Saving session: {name} - {strategy.reps} reps")
                db.save_session(name, strategy.reps)
