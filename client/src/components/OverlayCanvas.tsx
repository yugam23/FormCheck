import { useEffect, useRef } from 'react';

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

/**
 * Props for the OverlayCanvas component.
 */
interface OverlayCanvasProps {
    /** Array of detected landmarks (keypoints) */
    landmarks: Landmark[] | null;
    /** Canvas width in pixels */
    width?: number;
    /** Canvas height in pixels */
    height?: number;
}

const CONNECTIONS = [
  [11, 12], // Shoulders
  [11, 13], [13, 15], // Left Arm
  [12, 14], [14, 16], // Right Arm
  [11, 23], [12, 24], // Torso
  [23, 24], // Hips
  [23, 25], [25, 27], // Left Leg
  [24, 26], [26, 28]  // Right Leg
];

/**
 * Renders the skeletal wireframe overlay on top of the video feed.
 * Draws lines connecting recognized body landmarks.
 *
 * @param props - Component props containing landmark data
 */
export function OverlayCanvas({ landmarks, width = 640, height = 480 }: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks) {
        // Clear canvas if no landmarks
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, width, height);
        }
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, width, height);

    // Drawing settings
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#10B981'; // Default glow

    // Draw Connections
    ctx.strokeStyle = '#10B981'; // Primary Green
    
    CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        
        // Check visibility (MediaPipe visibility > 0.5 usually means detected)
        if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
             ctx.beginPath();
             ctx.moveTo(start.x * width, start.y * height);
             ctx.lineTo(end.x * width, end.y * height);
             ctx.stroke();
        }
    });

    // Draw Keypoints
    ctx.shadowBlur = 0; // Reset shadow for clean dots
    ctx.fillStyle = '#0F172A'; // Surface color for center
    ctx.strokeStyle = '#ffffff'; 
    ctx.lineWidth = 2;
    
    landmarks.forEach((lm) => {
        if (lm.visibility > 0.5) {
            const x = lm.x * width;
            const y = lm.y * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    });

  }, [landmarks, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
