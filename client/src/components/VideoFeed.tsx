import { useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import useWebSocket, { ReadyState } from 'react-use-websocket';



const VIDEO_WIDTH = 480; // Reduced from 640 for speed
const VIDEO_HEIGHT = 360; // Reduced from 480
const FRAME_RATE = 12; // Cap at 12 FPS for stability

/**
 * Bare-bones video feed component for the CockpitLayout.
 * handles webcam access and frame transmission independently.
 *
 * @example
 * ```tsx
 * <VideoFeed />
 * ```
 */
export function VideoFeed() {
  const webcamRef = useRef<Webcam>(null);
  const { sendMessage, readyState } = useWebSocket('ws://localhost:8000/ws', { share: true });

  const captureAndSend = useCallback(() => {
    if (
      readyState === ReadyState.OPEN &&
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
        const video = webcamRef.current.video;
        
        // Create an off-screen canvas to capture/resize the frame
        const canvas = document.createElement('canvas');
        canvas.width = VIDEO_WIDTH;
        canvas.height = VIDEO_HEIGHT;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            ctx.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
            // Compress to JPEG, 0.7 quality
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            
            // Send to backend
            // Payload format match: { type: "FRAME", payload: "...", timestamp: ... }
            const payload = JSON.stringify({
                type: 'FRAME',
                payload: base64.split(',')[1], // Remove 'data:image/jpeg;base64,' prefix
                timestamp: Date.now()
            });
            
            sendMessage(payload);
        }
    }
  }, [readyState, sendMessage]);

  useEffect(() => {
    const interval = setInterval(captureAndSend, 1000 / FRAME_RATE);
    return () => clearInterval(interval);
  }, [captureAndSend]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <Webcam
        ref={webcamRef}
        audio={false}
        width="100%"
        height="100%"
        screenshotFormat="image/jpeg"
        videoConstraints={{
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
