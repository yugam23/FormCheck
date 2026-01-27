import { useEffect, useRef } from 'react';

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface OverlayCanvasProps {
  landmarks: Landmark[] | null;
  width?: number;
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
    ctx.fillStyle = '#0F172A'; // Surface color for center
    ctx.strokeStyle = '#fff'; 
    
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
