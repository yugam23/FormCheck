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
    # We need to simulate Shoulder(11), Elbow(13), Wrist(15), Hip(23), Knee(25)
    # Angles needed:
    #   Elbow (11-13-15)
    #   Shoulder (13-11-23)
    #   Hip (11-23-25)

    def set_pose_angles(elbow_angle, shoulder_angle, hip_angle):
        # This is a bit tricky with just coordinates, so we'll approximate.
        # Alternatively, we can mock calculate_angle, but let's try to set coordinates that work.
        # Simpler approach: define coordinates that clearly result in these angles.

        # All points in 2D plane z=0
        # Shoulder at (0, 0)
        # Hip at (0, 10) (Vertical body) -> Hip-Knee needs to vary for Hip Angle
        # Elbow needs to vary relative to Shoulder and Wrist

        # Let's try to stick to the logic flow without complex geometry if possible,
        # but the code uses calculate_angle.
        # So we MUST provide coordinates that yield the angles.

        # Default vertical body: Shoulder(0,0), Hip(0,10), Knee(0,20) -> Hip Angle 180 (Line 11-23-25? No 11-23-25)
        # 11(0,0), 23(0,10), 25(0,20) -> Angle at 23. If straight line, 180.

        # Shoulder Angle: 13-11-23.
        # 11(0,0), 23(0,10).
        # If Arm is horizontal: 13(10,0). Angle 90.
        # If Arm is down: 13(0,5). Angle 0.
        # If Arm is up: 13(0,-5). Angle 180.

        # Elbow Angle: 11-13-15.
        # 11(0,0), 13(10,0).
        # If Arm straight: 15(20,0). Angle 180.
        # If Arm bent 90: 15(10,10). Angle 90.
        pass

    # Actually, let's just use the coordinates that were working or modify them to hit thresholds.
    # 1. Start Form: Elbow > 160, Shoulder > 40, Hip > 160.
    # Hip(23) at (0,10), Knee(25) at (0,20), Shoulder(11) at (0,0). -> Hip Angle 180 > 160. OK.
    # Shoulder(11) at (0,0), Hip(23) at (0,10).
    # Elbow(13) at (10, 0) -> Shoulder Angle (13-11-23) is 90 > 40. OK.
    # Elbow(13) at (10, 0), Wrist(15) at (20, 0) -> Elbow Angle (11-13-15) is 180 > 160. OK.

    landmarks[11] = Landmark(x=0, y=0, z=0, visibility=1.0)  # Shoulder
    landmarks[23] = Landmark(x=0, y=1, z=0, visibility=1.0)  # Hip
    landmarks[25] = Landmark(x=0, y=2, z=0, visibility=1.0)  # Knee

    landmarks[13] = Landmark(x=1, y=0, z=0, visibility=1.0)  # Elbow
    landmarks[15] = Landmark(x=2, y=0, z=0, visibility=1.0)  # Wrist

    # 1. Initialize Form
    result = strategy.process(landmarks)
    assert (
        result["feedback"]["message"] == "Fix Form"
        or result["feedback"]["message"] == "Down"
    )
    # Actually, strictly following logic:
    # form becomes 1.
    # elbow(180) > 160, shoulder(90) > 40, hip(180) > 160.
    # -> form=1
    # -> elbow > 160 ... -> feedback="Down"
    assert result["feedback"]["message"] == "Down"
    assert (
        result["reps"] == 0
    )  # Direction starts at 0. Condition: "if direction == 1". So count doesn't increment.

    # 2. Go Down (Elbow <= 90). "Up" phase in code.
    # Keep shoulder/hip/knee same.
    # Elbow(1,0). Wrist needs to make 90 deg.
    # 11(0,0) -> 13(1,0). Vector (-1, 0).
    # 15 needs to be at (1, 1). Vector (0, 1). Angle 90.
    landmarks[15] = Landmark(x=1, y=1, z=0, visibility=1.0)

    result = strategy.process(landmarks)
    assert result["feedback"]["message"] == "Up"
    assert (
        result["reps"] == 0.5
    )  # Direction was 0, now increments to 0.5 and direction becomes 1.

    # 3. Go Up (Elbow > 160). "Down" phase in code.
    landmarks[15] = Landmark(x=2, y=0, z=0, visibility=1.0)  # Straight again

    result = strategy.process(landmarks)
    assert result["feedback"]["message"] == "Down"
    assert (
        result["reps"] == 1.0
    )  # Direction was 1, now increments to 1.0 and direction becomes 0.


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
