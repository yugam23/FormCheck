import numpy as np
from typing import Dict, List, Tuple, Optional
from models import FormFeedback, RepData

class FormAnalyzer:
    def __init__(self):
        self.current_rep_count = 0
        self.stage = "up"  # "up" or "down"
        self.form_history = []
        
        # Thresholds
        self.pushup_down_threshold = 95  # degrees (elbow angle)
        self.pushup_up_threshold = 160   # degrees
        
        # Landmark indices (MediaPipe Pose)
        self.LEFT_SHOULDER = 11
        self.RIGHT_SHOULDER = 12
        self.LEFT_ELBOW = 13
        self.RIGHT_ELBOW = 14
        self.LEFT_WRIST = 15
        self.RIGHT_WRIST = 16
        self.LEFT_HIP = 23
        self.RIGHT_HIP = 24
        self.LEFT_KNEE = 25
        self.RIGHT_KNEE = 26
        self.LEFT_ANKLE = 27
        self.RIGHT_ANKLE = 28

    def calculate_angle(self, a: Dict, b: Dict, c: Dict) -> float:
        """
        Calculate the angle between three points (a, b, c) where b is the vertex.
        Points are dicts with 'x' and 'y' keys.
        """
        a = np.array([a['x'], a['y']])
        b = np.array([b['x'], b['y']])
        c = np.array([c['x'], c['y']])
        
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle

    def analyze_pushup(self, landmarks: List[Dict]) -> Tuple[FormFeedback, RepData]:
        """
        Analyze pushup form.
        """
        if not landmarks:
            return None, None

        # Helper to get landmark safely
        def get_lm(idx):
            return landmarks[idx]

        # Calculate elbow angles (using right side for now, could be dynamic or both)
        # Ideally check which side is more visible
        
        # Left side
        l_shoulder = get_lm(self.LEFT_SHOULDER)
        l_elbow = get_lm(self.LEFT_ELBOW)
        l_wrist = get_lm(self.LEFT_WRIST)
        
        # Right side
        r_shoulder = get_lm(self.RIGHT_SHOULDER)
        r_elbow = get_lm(self.RIGHT_ELBOW)
        r_wrist = get_lm(self.RIGHT_WRIST)
        
        left_angle = self.calculate_angle(l_shoulder, l_elbow, l_wrist)
        right_angle = self.calculate_angle(r_shoulder, r_elbow, r_wrist)
        
        # Use the arm that is more visible or simply average/min?
        # Let's use the average for stability if both are visible, or fallback.
        # For simplicity, we'll monitor both and trigger if EITHER hits depth, 
        # but realistically usage depends on camera angle. 
        # Let's use the one with higher visibility at the elbow.
        
        if l_elbow['visibility'] > r_elbow['visibility']:
            active_angle = left_angle
            side = "left"
        else:
            active_angle = right_angle
            side = "right"
            
        # Form Analysis & Rep Counting
        feedback_msg = "Keep going"
        feedback_color = "green"
        form_status = "good"
        
        # Logic for rep counting
        if active_angle > self.pushup_up_threshold:
            if self.stage == "down":
                self.stage = "up"
                self.current_rep_count += 1
                feedback_msg = "Rep complete!"
                feedback_color = "green"
        
        if active_angle < self.pushup_down_threshold:
            if self.stage == "up":
                self.stage = "down"
                feedback_msg = "Good depth!"
                feedback_color = "green"
            else:
                 feedback_msg = "Holding..."

        # Bad form detection (simple example: body straightness)
        # Check Shoulder-Hip-Knee angle
        if side == "left":
            body_angle = self.calculate_angle(
                get_lm(self.LEFT_SHOULDER),
                get_lm(self.LEFT_HIP),
                get_lm(self.LEFT_KNEE)
            )
        else:
            body_angle = self.calculate_angle(
                get_lm(self.RIGHT_SHOULDER),
                get_lm(self.RIGHT_HIP),
                get_lm(self.RIGHT_KNEE)
            )

        # Body should be roughly 180 (straight). If < 160, hips are piking or sagging
        if body_angle < 150:
             feedback_msg = "Straighten your back!"
             feedback_color = "red"
             form_status = "bad"
        
        feedback = FormFeedback(
            exercise="pushup",
            form_status=form_status,
            angle=active_angle,
            message=feedback_msg,
            color=feedback_color
        )
        
        rep_data = RepData(
            rep_count=self.current_rep_count,
            current_phase=self.stage,
            form_quality_score=95.0 # Placeholder score logic
        )
        
        return feedback, rep_data

    def analyze_squat(self, landmarks: List[Dict]) -> Tuple[FormFeedback, RepData]:
        """
        Analyze squat form.
        """
        if not landmarks:
            return None, None

        def get_lm(idx):
            return landmarks[idx]

        # Calculate Hip-Knee-Ankle angle
        l_hip = get_lm(self.LEFT_HIP)
        l_knee = get_lm(self.LEFT_KNEE)
        l_ankle = get_lm(self.LEFT_ANKLE)
        
        r_hip = get_lm(self.RIGHT_HIP)
        r_knee = get_lm(self.RIGHT_KNEE)
        r_ankle = get_lm(self.RIGHT_ANKLE)
        
        left_angle = self.calculate_angle(l_hip, l_knee, l_ankle)
        right_angle = self.calculate_angle(r_hip, r_knee, r_ankle)
        
        # Use average of both legs for stability
        active_angle = (left_angle + right_angle) / 2.0
        
        # Thresholds for Squat
        squat_down_threshold = 95
        squat_up_threshold = 160
        
        feedback_msg = "Keep going"
        feedback_color = "green"
        form_status = "good"
        
        # Rep Counting
        if active_angle > squat_up_threshold:
            if self.stage == "down":
                self.stage = "up"
                self.current_rep_count += 1
                feedback_msg = "Rep complete!"
                feedback_color = "green"
                
        if active_angle < squat_down_threshold:
            if self.stage == "up":
                self.stage = "down"
                feedback_msg = "Good depth!"
                feedback_color = "green"
            else:
                 feedback_msg = "Holding..."
                 
        # Bad form: Back angle (Shoulder-Hip-Knee)
        # Check if leaning too far forward
        l_back = self.calculate_angle(get_lm(self.LEFT_SHOULDER), get_lm(self.LEFT_HIP), get_lm(self.LEFT_KNEE))
        r_back = self.calculate_angle(get_lm(self.RIGHT_SHOULDER), get_lm(self.RIGHT_HIP), get_lm(self.RIGHT_KNEE))
        back_angle = (l_back + r_back) / 2.0
        
        if back_angle < 45: # Tilted too forward
             feedback_msg = "Chest up!"
             feedback_color = "red"
             form_status = "bad"

        feedback = FormFeedback(
            exercise="squat",
            form_status=form_status,
            angle=active_angle,
            message=feedback_msg,
            color=feedback_color
        )
        
        rep_data = RepData(
            rep_count=self.current_rep_count,
            current_phase=self.stage,
            form_quality_score=90.0
        )
        
        return feedback, rep_data
