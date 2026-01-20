"""
Pydantic models for WebSocket communication and data validation.
"""

from pydantic import BaseModel
from typing import List, Optional


class Landmark(BaseModel):
    """3D landmark coordinates from MediaPipe."""
    x: float
    y: float
    z: float
    visibility: float


class PoseResult(BaseModel):
    """Complete pose estimation result."""
    landmarks: List[Landmark]
    timestamp: float


class FormFeedback(BaseModel):
    """Form analysis feedback."""
    exercise: str  # "pushup" or "squat"
    form_status: str  # "good", "bad", or "neutral"
    angle: Optional[float] = None
    message: str
    color: str  # "green" or "red"


class RepData(BaseModel):
    """Repetition counting data."""
    rep_count: int
    current_phase: str  # "up", "down", "transition"
    form_quality_score: float  # 0-100
