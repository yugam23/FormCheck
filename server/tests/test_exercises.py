import pytest
from app.engine.exercises import PushupStrategy, SquatStrategy, ExerciseState
from app.schemas import Landmark


# Helper to create landmarks
def create_landmarks():
    return [Landmark(x=0, y=0, z=0, visibility=1.0) for _ in range(33)]


def test_pushup_strategy():
    strategy = PushupStrategy()
    landmarks = create_landmarks()

    # Helper to set relevant landmarks for pushup
    def set_pose(elbow_x, elbow_y, wrist_x, wrist_y, hip_y=0):
        landmarks[11] = Landmark(x=0, y=0, z=0, visibility=1.0)  # Shoulder
        landmarks[13] = Landmark(x=elbow_x, y=elbow_y, z=0, visibility=1.0)  # Elbow
        landmarks[15] = Landmark(x=wrist_x, y=wrist_y, z=0, visibility=1.0)  # Wrist
        landmarks[23] = Landmark(x=-1, y=hip_y, z=0, visibility=1.0)  # Hip
        landmarks[25] = Landmark(x=-2, y=0, z=0, visibility=1.0)  # Knee

    # 1. Start State - Arms Extended -> Transition to ECCENTRIC
    set_pose(1, 0, 2, 0, hip_y=0)  # Straight arm
    result = strategy.process(landmarks)
    assert result["state"] == "ECCENTRIC"
    assert "GO DOWN" in result["feedback"]["message"]

    # 2. Eccentric Phase - Bend elbow (< 90 degrees)
    set_pose(1, 1, 2, 0, hip_y=0)  # Elbow bent ~45 deg
    result = strategy.process(landmarks)
    assert result["state"] == "CONCENTRIC"
    assert "GO UP" in result["feedback"]["message"]

    # 3. Complete Rep - Extend arms again
    set_pose(1, 0, 2, 0, hip_y=0)  # Straight again
    result = strategy.process(landmarks)
    assert result["reps"] == 1
    assert result["state"] == "ECCENTRIC"  # Ready for next rep
    assert "REP COMPLETE" in result["feedback"]["message"]


def test_squat_strategy():
    strategy = SquatStrategy()
    landmarks = create_landmarks()

    # Hip(23), Knee(25), Ankle(27)
    # Straight leg (180 deg)
    landmarks[23] = Landmark(x=0, y=0, z=0, visibility=1.0)
    landmarks[25] = Landmark(x=0, y=1, z=0, visibility=1.0)
    landmarks[27] = Landmark(x=0, y=2, z=0, visibility=1.0)

    result = strategy.process(landmarks)
    assert result["state"] == "ECCENTRIC"

    # Squat Down (< 90 deg)
    # Hip(1,1), Knee(0,0), Ankle(1,0) -> 45 deg
    landmarks[23] = Landmark(x=1, y=1, z=0, visibility=1.0)
    landmarks[25] = Landmark(x=0, y=0, z=0, visibility=1.0)
    landmarks[27] = Landmark(x=1, y=0, z=0, visibility=1.0)

    result = strategy.process(landmarks)
    assert result["state"] == "CONCENTRIC"
