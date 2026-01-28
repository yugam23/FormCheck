
import { useRef, useEffect, useState, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import SkeletonOverlay from './SkeletonOverlay';

interface WebcamCaptureProps {
    onConnectionStatus?: (status: string) => void;
    onPoseDataUpdate?: (data: any) => void;
}

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const FRAME_RATE = 15;

const WebcamCapture = ({ onConnectionStatus, onPoseDataUpdate }: WebcamCaptureProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [poseData, setPoseData] = useState<any>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [fps, setFps] = useState(0);

    // WebSocket Connection
    // Using port 8000/ws as per existing server config, shared connection
    const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:8000/ws', { 
        share: true,
        shouldReconnect: () => true,
    });

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    // Notify parent of connection status
    useEffect(() => {
        if (onConnectionStatus) {
            onConnectionStatus(connectionStatus);
        }
    }, [connectionStatus, onConnectionStatus]);

    // Handle incoming messages
    useEffect(() => {
        if (lastMessage) {
            try {
                const data = JSON.parse(lastMessage.data);
                // Server sends: { type: "RESULT", landmarks: [], feedback: {}, ... }
                // or { type: "NO_DETECTION" }
                
                if (data.type === 'RESULT') {
                    setPoseData(data);
                    if (onPoseDataUpdate) {
                        onPoseDataUpdate(data);
                    }
                } else if (data.type === 'NO_DETECTION') {
                    // Start clearing pose data if needed, or keep last frame
                    // setPoseData(null); 
                }
            } catch (e) {
                console.error("Error parsing WS message", e);
            }
        }
    }, [lastMessage, onPoseDataUpdate]);

    // Setup Camera
    useEffect(() => {
        const setupCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT, facingMode: 'user' },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setIsCameraReady(true);
                        videoRef.current?.play();
                    };
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        setupCamera();
    }, []);

    // Frame processing loop
    // Adapted to use existing server protocol: { type: 'FRAME', payload: base64, timestamp: ... }
    useEffect(() => {
        if (!isCameraReady || readyState !== ReadyState.OPEN) return;

        const INTERVAL = 1000 / FRAME_RATE;
        let lastTime = 0;
        let animationFrameId: number;

        const processFrame = (timestamp: number) => {
            if (timestamp - lastTime >= INTERVAL) {
                lastTime = timestamp;
                setFps(Math.round(1000 / (timestamp - lastTime + INTERVAL)));

                if (videoRef.current && canvasRef.current) {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    
                    if (ctx) {
                        // Draw video to invisible canvas to get data
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        // Compress quality to reduce WS load (JPEG 0.5)
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                        const base64 = dataUrl.split(',')[1];

                        // Send to backend in existing format
                        sendMessage(JSON.stringify({
                            type: 'FRAME',
                            payload: base64,
                            timestamp: Date.now()
                        }));
                    }
                }
            }
            animationFrameId = requestAnimationFrame(processFrame);
        };

        animationFrameId = requestAnimationFrame(processFrame);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isCameraReady, readyState, sendMessage]);

    return (
        <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black border border-gray-800">
            {/* Video Feed */}
            <video
                ref={videoRef}
                className="w-full h-auto object-cover transform scale-x-[-1]" // Mirror effect
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                playsInline
                muted
            />

            {/* Hidden processing canvas */}
            <canvas
                ref={canvasRef}
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                className="hidden"
            />

            {/* Skeleton Overlay */}
            {poseData && (
                <div className="absolute inset-0 pointer-events-none transform scale-x-[-1]">
                    <SkeletonOverlay poseData={poseData} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} />
                </div>
            )}

            {/* Feedback Text Overlay - Not Mirrored */}
            {poseData?.feedback && (
                <div className="absolute top-8 left-0 w-full text-center pointer-events-none z-10 flex flex-col items-center justify-center">
                    <h2
                        className="text-4xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-300"
                        style={{ color: poseData.feedback.color === 'red' ? '#EF4444' : '#4ADE80' }}
                    >
                        {poseData.feedback.message}
                    </h2>
                    {poseData.feedback.angle !== undefined && (
                        <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full mt-2 border border-white/10">
                            <p className="text-lg text-white font-mono">
                                {Math.round(poseData.feedback.angle)}°
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Stats Overlay */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-lg text-white border border-white/10">
                <div className="text-xs text-gray-400">FPS</div>
                <div className="font-mono text-lg font-bold text-green-400">{fps > 0 ? fps : '--'}</div>
            </div>

            {connectionStatus !== 'Open' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
                    <div className="text-white text-center p-4">
                        {connectionStatus === 'Error' || connectionStatus === 'Closed' ? (
                            <>
                                <div className="text-red-500 text-3xl mb-2">⚠</div>
                                <p className="text-lg font-bold text-red-500 mb-1">Connection Failed</p>
                                <p className="text-sm text-gray-400">Please make sure the backend server is running.</p>
                            </>
                        ) : (
                            <>
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-sm font-medium">Connecting to AI Server...</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebcamCapture;
