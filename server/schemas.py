from pydantic import BaseModel
from typing import List, Optional


class Landmark(BaseModel):
    x: float
    y: float
    z: float
    visibility: float


class PoseResult(BaseModel):
    landmarks: List[Landmark]
    # We will add world_landmarks later if needed for 3D analysis
