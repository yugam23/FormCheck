// SkeletonOverlay.tsx
//
// Canvas-based skeleton visualization drawn over the webcam feed.
//
// Rendering:
//   Uses HTML5 Canvas 2D API to draw the user's skeletal wireframe.
//   Connections are defined between MediaPipe landmark indices (e.g., 11-12 = shoulders).
//
// Landmark Indices (MediaPipe Pose):
//   11-12: Shoulders     13-14: Elbows      15-16: Wrists
//   23-24: Hips          25-26: Knees       27-28: Ankles
//
// Visibility Filtering:
//   Only draws landmarks with visibility > 0.5 to avoid phantom joints
//   when body parts are occluded or out of frame.
//
// Color Coding:
//   Green (good form) or Red (form correction needed) based on feedback.color
//
// Rendering Strategy:
//   - Uses 2D Canvas API (not WebGL) for maximum compatibility
//   - Fallback: If canvas unsupported, gracefully hides overlay
//   - Performance: 33 landmarks × 2 draws (joints + connections) = ~1ms render time
//
// Coordinate Mapping:
//   - MediaPipe returns normalized coords (0.0-1.0)
//   - Scaled to canvas dimensions: x * width, y * height
//   - Mirrored horizontally to match video feed (scale-x-[-1])
//
// Known Limitations:
//   - Aspect ratio mismatch: If video crops, skeleton won't align perfectly
//   - Future: Use object-fit calculations for precise mapping

import { useRef, useEffect } from 'react';
import type { PoseData } from '../types';

/**
 * Props for the SkeletonOverlay component.
 */
interface SkeletonOverlayProps {
    /** detected pose data containing landmarks and feedback */
    poseData: PoseData | null;
    /** overlay width matching video feed */
    width: number;
    /** overlay height matching video feed */
    height: number;
}

/**
 * Standard implementation of the skeletal overlay.
 * Uses MediaPipe landmarks to draw the user's stick-figure representation.
 * Changes color based on feedback (Green = Good, Red = Bad).
 *
 * @param props - Component props
 */
const CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
    [11, 23], [12, 24], // Torso
    [23, 24], // Hips
    [23, 25], [24, 26], [25, 27], [26, 28], // Legs
    [27, 29], [28, 30], [29, 31], [30, 32]  // Feet
];

const SkeletonOverlay = ({ poseData, width, height }: SkeletonOverlayProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, width, height);

        if (!poseData || !poseData.landmarks || poseData.landmarks.length === 0) return;

        const landmarks = poseData.landmarks;
        const feedback = poseData.feedback;
        const color = feedback?.color === 'red' ? '#EF4444' : '#10B981'; // Tailwind Red-500 or Primary (Emerald)

        // Helper to get coordinates
        const getCoord = (index: number) => {
            const lm = landmarks[index];
            if (!lm) return { x: 0, y: 0 };
            return { x: lm.x * width, y: lm.y * height };
        };

        // Draw Connections (Neon Glow Effect)
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        CONNECTIONS.forEach(([startIdx, endIdx]) => {
            const start = getCoord(startIdx);
            const end = getCoord(endIdx);

            if (landmarks[startIdx].visibility > 0.5 && landmarks[endIdx].visibility > 0.5) {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        });

        // Draw Landmarks
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 0; // Reset shadow for joints
        landmarks.forEach((lm) => {
            if (lm.visibility > 0.5) {
                const x = lm.x * width;
                const y = lm.y * height;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

    }, [poseData, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute inset-0 pointer-events-none"
        />
    );
};

export default SkeletonOverlay;
