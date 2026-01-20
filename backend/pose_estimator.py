import mediapipe as mp
import cv2
import numpy as np
import base64
from typing import Optional, List, Dict, Any

class PoseEstimator:
    def __init__(self):
        """Initialize MediaPipe Pose."""
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def process_frame(self, frame_data: str) -> Optional[Any]:
        """
        Process a base64 encoded image frame and return pose results.
        
        Args:
            frame_data: Base64 encoded image string (e.g., "data:image/jpeg;base64,...")
            
        Returns:
            MediaPipe pose results object or None if processing fails.
        """
        try:
            # Decode base64 image
            if "," in frame_data:
                frame_data = frame_data.split(",")[1]
            
            image_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return None

            # Convert BGR to RGB (MediaPipe expects RGB)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process the image
            results = self.pose.process(image_rgb)
            
            return results
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return None

    def get_landmarks_dict(self, results) -> List[Dict[str, float]]:
        """
        Convert MediaPipe results to a list of dicts for JSON serialization.
        """
        if not results or not results.pose_landmarks:
            return []
            
        landmarks = []
        for lm in results.pose_landmarks.landmark:
            landmarks.append({
                "x": lm.x,
                "y": lm.y,
                "z": lm.z,
                "visibility": lm.visibility
            })
        return landmarks
