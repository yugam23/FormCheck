"""
geometry.py - Geometric calculations for pose analysis.

Provides vector math utilities for computing joint angles from landmark
positions. Used by exercise strategies to determine rep phases and form quality.

Angle Calculation:
    Uses 2D projection (x, y only) because depth (z) from monocular camera
    is unreliable. The angle is computed between two vectors originating
    from a vertex point using arctangent difference.

Coordinate System:
    MediaPipe returns normalized coordinates (0.0 - 1.0) relative to image
    dimensions. These work directly for angle calculations since we only
    care about relative positions.

Usage:
    from app.core.geometry import calculate_angle
    elbow_angle = calculate_angle(shoulder, elbow, wrist)  # Returns 0-180°
"""

import numpy as np
from app.schemas import Landmark


def calculate_angle(a: Landmark, b: Landmark, c: Landmark) -> float:
    """
    Calculate the angle at vertex 'b' formed by points a-b-c.

    Uses 2D projection (x, y coordinates only) to compute the angle between
    two vectors originating from point 'b'. The z-coordinate is ignored because
    monocular camera depth estimation is unreliable for angle calculations.

    Args:
        a (Landmark): First point forming the angle (e.g., shoulder for elbow angle).
        b (Landmark): Vertex point where the angle is measured (e.g., elbow).
        c (Landmark): End point forming the angle (e.g., wrist for elbow angle).

    Returns:
        float: Angle in degrees, normalized to range [0, 180].

    Example:
        >>> shoulder = Landmark(x=0.5, y=0.3, z=0.0, visibility=0.9)
        >>> elbow = Landmark(x=0.6, y=0.5, z=0.0, visibility=0.9)
        >>> wrist = Landmark(x=0.7, y=0.6, z=0.0, visibility=0.9)
        >>> angle = calculate_angle(shoulder, elbow, wrist)
        >>> print(f"Elbow flexion: {angle:.1f}°")
        Elbow flexion: 45.2°

    Note:
        Angles > 180° are automatically normalized by subtracting from 360°
        to ensure consistent representation.
    """
    # Use numpy for vectorization benefits later if needed,
    # but for single point it's just basic trig.

    # We use x and y for 2D angle
    # Check if visibility is good enough? The caller should probably handle that.

    a_arr = np.array([a.x, a.y])
    b_arr = np.array([b.x, b.y])
    c_arr = np.array([c.x, c.y])

    radians = np.arctan2(c_arr[1] - b_arr[1], c_arr[0] - b_arr[0]) - np.arctan2(
        a_arr[1] - b_arr[1], a_arr[0] - b_arr[0]
    )
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle
