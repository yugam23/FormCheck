import pytest
from app.engine.exercises import PushupStrategy, SquatStrategy, ExerciseState
from app.schemas import Landmark


# Helper to create landmarks
def create_landmarks():
    return [Landmark(x=0, y=0, z=0, visibility=1.0) for _ in range(33)]


def test_pushup_strategy():
    strategy = PushupStrategy()
    landmarks = create_landmarks()

    # 1. Start State - Arms Extended (angle ~180) -> Should tell to go down (State changes to ECCENTRIC)
    # We need to set shoulder(11), elbow(13), wrist(15)
    # Straight arm:
    landmarks[11] = Landmark(x=0, y=0, z=0, visibility=1.0)  # Shoulder
    landmarks[13] = Landmark(x=0, y=1, z=0, visibility=1.0)  # Elbow
    landmarks[15] = Landmark(x=0, y=2, z=0, visibility=1.0)  # Wrist
    # This is 180 degrees.

    result = strategy.process(landmarks)
    assert result["state"] == "ECCENTRIC"
    assert "GO DOWN" in result["feedback"]["message"]

    # 2. Go Down - Angle < 90
    landmarks[13] = Landmark(x=0.5, y=0.1, z=0, visibility=1.0)  # Elbow bent
    # Creating 90 deg manually is hard with coords, let's just trust geometry module works
    # and simluating the angle logic if we could mock calculate_angle.
    # But since we invoke process(), we rely on real calculate_angle.
    # Let's try to pass geometric points that form 90 deg.
    # Shoulder (1,1), Elbow (0,0), Wrist (1,0) -> 45 deg (Acute)
    landmarks[11] = Landmark(x=1, y=1, z=0, visibility=1.0)
    landmarks[13] = Landmark(x=0, y=0, z=0, visibility=1.0)
    landmarks[15] = Landmark(x=1, y=0, z=0, visibility=1.0)

    result = strategy.process(landmarks)
    assert result["state"] == "CONCENTRIC"
    assert "GOOD DEPTH" in result["feedback"]["message"]

    # 3. Go Up - Angle > 160
    landmarks[13] = Landmark(x=1, y=2, z=0, visibility=1.0)
    landmarks[15] = Landmark(x=1, y=3, z=0, visibility=1.0)  # Straight again

    result = strategy.process(landmarks)
    assert result["reps"] == 1
    assert result["state"] == "START"


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
