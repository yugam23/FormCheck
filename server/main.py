from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json
from pose_detector import PoseDetector
from rep_counter import RepCounter

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
detector = PoseDetector()
counter = RepCounter()


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "FormCheck API"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "FRAME":
                    payload = message.get("payload")
                    timestamp = message.get("timestamp")

                    # Run inference
                    pose_result = detector.process_frame(payload)

                    if pose_result and pose_result.landmarks:
                        # Process Logic
                        logic_result = counter.process(pose_result.landmarks)

                        response = {
                            "type": "RESULT",
                            "timestamp": timestamp,
                            "landmarks": [lm.dict() for lm in pose_result.landmarks],
                            "reps": logic_result["reps"],
                            "feedback": logic_result["feedback"],
                            "state": logic_result["state"],
                        }
                    else:
                        response = {"type": "NO_DETECTION"}

                    await websocket.send_text(json.dumps(response))
            except json.JSONDecodeError:
                pass
            except Exception as e:
                print(f"Error handling frame: {e}")

    except WebSocketDisconnect:
        print("Client disconnected")
