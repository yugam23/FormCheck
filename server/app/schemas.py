"""
schemas.py - Pydantic models for pose detection data structures.

Defines the data contracts between the pose detector and exercise strategies.
Using Pydantic provides automatic validation and .dict() serialization
for JSON WebSocket responses.

Landmark Coordinates:
    - x, y: Normalized position (0.0-1.0 relative to image dimensions)
    - z: Depth estimate (less reliable, relative to hip midpoint)
    - visibility: Confidence score (0.0-1.0) for this landmark
"""

from pydantic import BaseModel
from typing import List


class Landmark(BaseModel):
    x: float
    y: float
    z: float
    visibility: float


class PoseResult(BaseModel):
    landmarks: List[Landmark]
