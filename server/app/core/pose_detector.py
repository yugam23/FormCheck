import mediapipe as mp
import cv2
import numpy as np
import base64
from app.schemas import Landmark, PoseResult


class PoseDetector:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,  # 0=Lite, 1=Full, 2=Heavy. 1 is good balance.
            smooth_landmarks=True,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def process_frame(self, base64_string: str) -> PoseResult | None:
        try:
            # Decode base64 to image
            image_bytes = base64.b64decode(base64_string)
            np_arr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if image is None:
                return None

            # Convert BGR to RGB (MediaPipe expects RGB)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # Process
            results = self.pose.process(image_rgb)

            if results.pose_landmarks:
                landmarks = []
                for lm in results.pose_landmarks.landmark:
                    landmarks.append(
                        Landmark(x=lm.x, y=lm.y, z=lm.z, visibility=lm.visibility)
                    )
                return PoseResult(landmarks=landmarks)

            return None

        except Exception as e:
            print(f"Error processing frame: {e}")
            return None

    def close(self):
        self.pose.close()
