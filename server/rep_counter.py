from enum import Enum, auto
from typing import List, Optional, Dict
from schemas import Landmark
from geometry import calculate_angle


class ExerciseState(Enum):
    START = auto()
    ECCENTRIC = auto()  # Going down
    CONCENTRIC = auto()  # Going up
    COMPLETED = auto()  # Rep finished


class RepCounter:
    def __init__(self):
        self.reps = 0
        self.state = ExerciseState.START
        self.feedback = "READY"

    def process(self, landmarks: List[Landmark]) -> Dict:
        # Map needed landmarks (MediaPipe indices)
        # 11: Left Shoulder, 13: Left Elbow, 15: Left Wrist
        # 23: Left Hip, 25: Left Knee, 27: Left Ankle
        try:
            shoulder = landmarks[11]
            elbow = landmarks[13]
            wrist = landmarks[15]

            # Calculate Elbow Angle (for Pushup Depth)
            elbow_angle = calculate_angle(shoulder, elbow, wrist)

            # Logic for Pushups
            # Thresholds:
            # - Start: Arms extended (> 160 deg)
            # - Down: < 90 deg
            # - Up: Back to > 160 deg

            if self.state == ExerciseState.START:
                if elbow_angle > 160:
                    self.feedback = "GO DOWN"
                    self.state = ExerciseState.ECCENTRIC

            elif self.state == ExerciseState.ECCENTRIC:
                if elbow_angle < 90:
                    self.feedback = "GOOD DEPTH! PUSH UP"
                    self.state = ExerciseState.CONCENTRIC
                else:
                    self.feedback = f"LOWER: {int(elbow_angle)}°"

            elif self.state == ExerciseState.CONCENTRIC:
                if elbow_angle > 160:
                    self.reps += 1
                    self.feedback = "REP COMPLETE"
                    self.state = ExerciseState.START
                elif elbow_angle < 80:  # Too deep/resting
                    self.feedback = "PUSH UP!"

            return {
                "reps": self.reps,
                "state": self.state.name,
                "feedback": self.feedback,
                "angles": {"elbow_left": elbow_angle},
            }

        except IndexError:
            # Not enough landmarks detected
            return {
                "reps": self.reps,
                "state": "UKNOWN",
                "feedback": "ADJUST CAMERA",
                "angles": {},
            }
