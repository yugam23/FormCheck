from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import time
from typing import Dict, Any, List
import os
from dotenv import load_dotenv

from app.core.pose_detector import PoseDetector
from app.core.connection_manager import ConnectionManager
from app.engine.exercises import get_strategy
from app.database import db

# Security & Validation
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import structlog
import sentry_sdk

# Load environment variables
load_dotenv()

# Sentry Init
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=1.0,  # Capture 100% of transactions for performance monitoring
        profiles_sample_rate=1.0, # Capture 100% for profiling
    )

# Configure Structured Logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)
logger = structlog.get_logger()

app = FastAPI()

# Rate Limiting Setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Environment-aware CORS configuration
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [
    origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()
]

environment = os.getenv("ENVIRONMENT", "development")
if environment == "development":
    allowed_origins = ["*"]

logger.info("cors_configured", allowed_origins=allowed_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PATCH", "PUT"],
    allow_headers=["Content-Type", "Authorization"],
)

# Global Services
manager = ConnectionManager()
MAX_WS_CONNECTIONS = 20  # Limit active WS connections

# Session State: WebSocket -> Dict {"strategy": ExerciseStrategy, "name": str}
active_sessions: Dict[WebSocket, Dict[str, Any]] = {}


@app.get("/health")
@limiter.limit("10/minute")
def health_check(request: Request):
    return {
        "status": "ok",
        "service": "FormCheck API V2",
        "active_connections": len(manager.active_connections),
    }


@app.get("/api/sessions")
@limiter.limit("60/minute")
def get_sessions(request: Request, limit: int = Query(default=10, ge=-1, le=1000)):
    return db.get_recent_sessions(limit)


@app.get("/api/stats")
@limiter.limit("60/minute")
def get_stats(request: Request):
    """Return dashboard stats (streak, total reps, etc)"""
    return db.get_stats()


@app.get("/api/analytics")
@limiter.limit("30/minute")
def get_analytics(request: Request):
    """Return advanced analytics (PRs, Distribution)"""
    return db.get_analytics()


class GoalUpdate(BaseModel):
    goal: int


@app.get("/api/settings/goal")
def get_goal():
    return {"goal": db.get_goal()}


@app.post("/api/settings/goal")
def set_goal(data: GoalUpdate):
    db.set_goal(data.goal)
    return {"status": "updated", "goal": data.goal}


class SessionCreate(BaseModel):
    exercise: str
    reps: int
    duration: int = 0


@app.post("/api/save-session")
def save_session(session: SessionCreate):
    """Manually save a completed session"""
    logger.info("manual_save", exercise=session.exercise, reps=session.reps)
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
    # Connection Limit Check
    if len(manager.active_connections) >= MAX_WS_CONNECTIONS:
        logger.warn("ws_connection_rejected", reason="capacity_reached")
        await websocket.close(code=1008, reason="Server busy")
        return

    await manager.connect(websocket)
    detector = PoseDetector()

    # Initialize default session
    active_sessions[websocket] = {
        "strategy": get_strategy("Pushups"),
        "name": "Pushups",
        "start_time": time.time(),
    }

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get("type", "FRAME")

                if msg_type == "INIT":
                    # Client signaling exercise type
                    exercise_name = message.get("exercise", "Pushups")
                    active_sessions[websocket] = {
                        "strategy": get_strategy(exercise_name),
                        "name": exercise_name,
                        "start_time": time.time(),
                    }
                    logger.info("client_init", exercise=exercise_name)

                elif msg_type == "FRAME":
                    payload = message.get("payload")
                    timestamp = message.get("timestamp")

                    session = active_sessions.get(websocket)
                    if not session:
                        continue

                    strategy = session["strategy"]
                    pose_result = detector.process_frame(payload)

                    if pose_result and pose_result.landmarks:
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
                logger.error("ws_msg_error", error=str(e))

    except WebSocketDisconnect:
        logger.info("client_disconnect")
        manager.disconnect(websocket)
        detector.close()

        # Save session data
        session = active_sessions.pop(websocket, None)
        if session:
            strategy = session["strategy"]
            name = session["name"]
            # Save if there was activity (reps > 0)
            if strategy.reps > 0:
                end_time = time.time()
                start_time = session.get("start_time", end_time)
                duration = int(end_time - start_time) if start_time else 0

                logger.info(
                    "saving_session",
                    exercise=name,
                    reps=strategy.reps,
                    duration=duration,
                )
                db.save_session(name, strategy.reps, duration)
