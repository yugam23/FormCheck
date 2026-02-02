"""
exercises.py - Exercise-specific rep counting and form feedback logic.

Implements the Strategy Pattern: each exercise type (Pushups, Squats, Plank)
has its own strategy class with custom state machine logic for counting reps
and providing real-time form feedback.

State Machine (for rep-based exercises):
    START -> ECCENTRIC (going down) -> CONCENTRIC (going up) -> START (rep complete)

Each strategy monitors specific joint angles:
    - Pushups: Elbow angle (shoulder-elbow-wrist)
    - Squats: Knee angle (hip-knee-ankle)
    - Plank: Body alignment (shoulder-hip-ankle)

Form Thresholds:
    These are calibrated angles that distinguish good form from bad:
    - Pushup depth: <90° elbow angle (proper depth)
    - Squat depth: <90° knee angle (parallel or below)
    - Plank form: 160-200° alignment (straight body)

Adding New Exercises:
    1. Create a new class extending ExerciseStrategy
    2. Implement process() with landmark indices and angle thresholds
    3. Add to EXERCISE_MAP dictionary

Landmark Indices (MediaPipe pose):
    11: Left shoulder, 13: Left elbow, 15: Left wrist
    23: Left hip, 25: Left knee, 27: Left ankle
    See: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
"""

from abc import ABC, abstractmethod
from enum import Enum, auto
from typing import List, Dict, Optional
from app.schemas import Landmark
from app.core.geometry import calculate_angle


# State Machine Diagram:
#
#     ┌─────────┐
#     │  START  │◄──────────────────┐
#     └────┬────┘                   │
#          │ angle > 160°           │
#          ▼                        │
#     ┌──────────┐                  │
#     │ ECCENTRIC│ (going down)     │
#     └────┬─────┘                  │
#          │ angle < 90°            │
#          ▼                        │
#     ┌──────────┐                  │
#     │CONCENTRIC│ (going up)       │
#     └────┬─────┘                  │
#          │ angle > 160°           │
#          └────────────────────────┘
#              (rep complete)
#
# Pushups: monitors elbow angle (shoulder-elbow-wrist)
# Squats:  monitors knee angle (hip-knee-ankle)
# Plank:   monitors body alignment (shoulder-hip-ankle)


class ExerciseState(Enum):
    START = auto()
    ECCENTRIC = auto()  # Going down
    CONCENTRIC = auto()  # Going up
    COMPLETED = auto()  # Rep finished


class ExerciseStrategy(ABC):
    def __init__(self):
        self.reps = 0
        self.state = ExerciseState.START
        self.feedback = {"message": "READY", "color": "green"}  # Structured feedback

    @abstractmethod
    def process(self, landmarks: List[Landmark]) -> Dict:
        pass

    def reset(self):
        self.reps = 0
        self.state = ExerciseState.START
        self.feedback = {"message": "READY", "color": "green"}


class PushupStrategy(ExerciseStrategy):
    def process(self, landmarks: List[Landmark]) -> Dict:
        """
        Pushup Logic:
        - Monitors Elbow Angle (Left side default for now)
        - Depth: < 90 deg
        - Extension: > 160 deg
        """
        try:
            # Left side
            shoulder = landmarks[11]
            elbow = landmarks[13]
            wrist = landmarks[15]

            angle = calculate_angle(shoulder, elbow, wrist)

            # Update State
            if self.state == ExerciseState.START:
                if angle > 160:
                    self.feedback = {"message": "GO DOWN", "color": "blue"}
                    self.state = ExerciseState.ECCENTRIC

            elif self.state == ExerciseState.ECCENTRIC:
                if angle < 90:
                    self.feedback = {
                        "message": "GOOD DEPTH",
                        "color": "green",
                        "angle": angle,
                    }
                    self.state = ExerciseState.CONCENTRIC
                else:
                    self.feedback = {"message": "LOWER", "color": "red", "angle": angle}

            elif self.state == ExerciseState.CONCENTRIC:
                if angle > 160:
                    self.reps += 1
                    self.feedback = {"message": "REP COMPLETE", "color": "green"}
                    self.state = ExerciseState.START
                elif angle < 80:
                    self.feedback = {"message": "UP UP UP", "color": "red"}

            return {
                "reps": self.reps,
                "state": self.state.name,
                "feedback": self.feedback,
            }
        except IndexError:
            return {"reps": self.reps, "feedback": {"message": "NO POSE"}}


class SquatStrategy(ExerciseStrategy):
    def process(self, landmarks: List[Landmark]) -> Dict:
        """
        Squat Logic:
        - Monitors Hip/Knee Angle
        - Hip > Knee vertically? No, we use knee angle.
        - Angle: Hip-Knee-Ankle.
        - Standing: > 160
        - Deep Squat: < 90 (or 100 depending on flexibility)
        """
        try:
            hip = landmarks[23]
            knee = landmarks[25]
            ankle = landmarks[27]

            angle = calculate_angle(hip, knee, ankle)

            if self.state == ExerciseState.START:
                if angle > 160:
                    self.feedback = {"message": "SQUAT DOWN", "color": "blue"}
                    self.state = ExerciseState.ECCENTRIC

            elif self.state == ExerciseState.ECCENTRIC:
                if angle < 90:
                    self.feedback = {
                        "message": "GOOD DEPTH",
                        "color": "green",
                        "angle": angle,
                    }
                    self.state = ExerciseState.CONCENTRIC
                elif angle < 120:
                    self.feedback = {"message": "LOWER", "color": "red", "angle": angle}

            elif self.state == ExerciseState.CONCENTRIC:
                if angle > 165:
                    self.reps += 1
                    self.feedback = {"message": "REP COMPLETE", "color": "green"}
                    self.state = ExerciseState.START

            return {
                "reps": self.reps,
                "state": self.state.name,
                "feedback": self.feedback,
            }
        except IndexError:
            return {"reps": self.reps, "feedback": {"message": "NO POSE"}}


class PlankStrategy(ExerciseStrategy):
    def __init__(self):
        super().__init__()
        self.duration_frames = 0  # Naive counter (frame based)
        # Ideally we'd use timestamp, but this is a simple start

    def process(self, landmarks: List[Landmark]) -> Dict:
        """
        Plank Logic:
        - Shoulder-Hip-Ankle should be ~180
        """
        try:
            shoulder = landmarks[11]
            hip = landmarks[23]
            ankle = landmarks[27]

            angle = calculate_angle(shoulder, hip, ankle)

            # Tolerance 160-200 (straight line)
            is_good_form = 160 < angle < 200  # Approx straight

            if is_good_form:
                self.duration_frames += 1
                # Assuming 15fps, roughly
                seconds = self.duration_frames // 15
                self.feedback = {"message": "HOLD IT", "color": "green", "angle": angle}

                # Hack: overriding reps to display time
                return {"reps": seconds, "state": "HOLDING", "feedback": self.feedback}
            else:
                self.feedback = {"message": "FIX HIPS", "color": "red", "angle": angle}
                return {
                    "reps": self.duration_frames // 15,
                    "state": "BAD FORM",
                    "feedback": self.feedback,
                }

        except IndexError:
            return {"reps": 0, "feedback": {"message": "NO POSE"}}


EXERCISE_MAP = {
    "Pushups": PushupStrategy,
    "Squats": SquatStrategy,
    "Plank": PlankStrategy,
}


def get_strategy(name: str) -> ExerciseStrategy:
    return EXERCISE_MAP.get(name, PushupStrategy)()


# MediaPipe Pose Landmark Indices (33 total):
#
#        11 ●────●──────● 12  (shoulders)
#          /      \
#      13 ●        ● 14       (elbows)
#          \      /
#      15 ●────●──────● 16    (wrists)
#             |
#      23 ●───┴───● 24        (hips)
#             |
#      25 ●───┴───● 26        (knees)
#             |
#      27 ●───┴───● 28        (ankles)
#
# Full index reference: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
#
# Common Indices:
#   11, 12: Left/Right Shoulder
#   13, 14: Left/Right Elbow
#   15, 16: Left/Right Wrist
#   23, 24: Left/Right Hip
#   25, 26: Left/Right Knee
#   27, 28: Left/Right Ankle
