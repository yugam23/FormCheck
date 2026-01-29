import numpy as np
from app.schemas import Landmark


def calculate_angle(a: Landmark, b: Landmark, c: Landmark) -> float:
    """
    Calculate an angle between three skeletal landmarks.
    a: First point
    b: Mid point (vertex)
    c: End point
    Returns angle in degrees.
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
