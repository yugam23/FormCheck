from pydantic import BaseModel
from typing import List


class Landmark(BaseModel):
    x: float
    y: float
    z: float
    visibility: float


class PoseResult(BaseModel):
    landmarks: List[Landmark]
