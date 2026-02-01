
import { useRef, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import SkeletonOverlay from './SkeletonOverlay';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { PoseData } from '../types';

import { VIDEO_WIDTH, VIDEO_HEIGHT, FRAME_RATE, WS_URL } from '../lib/constants';

/**
 * Props for the WebcamCapture component.
 */
interface WebcamCaptureProps {
    /** Name of the active exercise for backend configuration */
    activeExercise?: string;
    /** Callback for WebSocket connection status updates */
    onConnectionStatus?: (status: string) => void;
    /** Callback for receiving pose detection data */
    onPoseDataUpdate?: (data: PoseData | null) => void;
    /** Current pose data for overlay synchronization */
    poseData: PoseData | null;
    /** Flag indicating if a workout session is currently active */
    sessionActive?: boolean;
}

/**
 * Handles webcam stream, video frame processing, and WebSocket communication.
 *
 * Features:
 * - Captures video frames at 15 FPS
 * - Sends JPEG compressed frames to backend via WebSocket
 * - Receives and parses pose detection results
 * - Renders skeleton overlay synchronized with video
 *
 * @param props - Component props
 */
const WebcamCapture = ({ activeExercise = 'Pushups', onConnectionStatus, onPoseDataUpdate, poseData, sessionActive = false }: WebcamCaptureProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [fps, setFps] = useState(0);

    // WebSocket Connection
    // Using port 8000/ws as per existing server config, shared connection
    const { sendMessage, lastMessage, readyState } = useWebSocket(WS_URL, { 
        share: true,
        shouldReconnect: () => true,
        reconnectAttempts: 10,
        reconnectInterval: (attemptNumber: number) => Math.min(Math.pow(2, attemptNumber) * 1000, 10000), // Exponential backoff
        onOpen: () => {
             // Send Init Message on Connect
            const initMsg = {
                type: 'INIT',
                exercise: activeExercise
            };
            console.log("Sending INIT:", initMsg);
        }
    });

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    // Reset session when sessionActive triggers
    useEffect(() => {
        if (sessionActive && readyState === ReadyState.OPEN) {
            console.log("Session Started: Sending INIT reset");
            sendMessage(JSON.stringify({
                type: 'INIT',
                exercise: activeExercise
            }));
        }
    }, [sessionActive, readyState, activeExercise, sendMessage]);

    // Listen for ReadyState changes to send INIT
    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
             console.log("WS Open, sending INIT for", activeExercise);
             sendMessage(JSON.stringify({
                type: 'INIT',
                exercise: activeExercise
            }));
        }
    }, [readyState, activeExercise, sendMessage]);

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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = JSON.parse(lastMessage.data);
                // Server sends: { type: "RESULT", landmarks: [], feedback: {}, ... }
                // or { type: "NO_DETECTION" }
                
                if (data.type === 'RESULT') {
                    // Update parent ONLY
                    if (onPoseDataUpdate) {
                        onPoseDataUpdate(data as PoseData);
                    }
                } else if (data.type === 'NO_DETECTION') {
                     // Notify parent of no detection to clear skeletons
                     if (onPoseDataUpdate) {
                         onPoseDataUpdate(null);
                     }
                }
            } catch (e) {
                console.error("Error parsing WS message", e);
            }
        }
    }, [lastMessage, onPoseDataUpdate]);

    // Setup Camera
    useEffect(() => {
        let stream: MediaStream | null = null;

        const setupCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
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

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Frame processing loop
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

                        // Only send to backend if session is active
                        if (sessionActive) {
                            // Compress quality to reduce WS load (JPEG 0.6)
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
            }
            animationFrameId = requestAnimationFrame(processFrame);
        };

        animationFrameId = requestAnimationFrame(processFrame);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isCameraReady, readyState, sendMessage, sessionActive]);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
            {/* Video Feed */}
            <video
                className="w-full h-full object-contain transform scale-x-[-1]" // Mirror effect, object-contain to preserve aspect ratio
                playsInline
                muted
                aria-label="Live webcam feed"
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
                <div className="absolute inset-0 pointer-events-none transform scale-x-[-1] flex items-center justify-center">
                    {/* Container to match video aspect ratio if possible, but absolute overlay works for now */}
                     <div className="relative" style={{ width: '100%', height: '100%', maxHeight: '100%' }}>
                         {/* We need to make sure the overlay matches the video dimensions exactly if object-contain crops/pads */}
                         {/* For simplicity we assume video fills or we use absolute positioning on a wrapper that has expected aspect ratio */}
                         <SkeletonOverlay poseData={poseData} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} />
                     </div>
                </div>
            )}

            {/* Feedback Text Overlay - Removed per user request */}
            {/* 
            {poseData?.feedback && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 flex flex-col items-center justify-center">
                   
                </div>
            )} 
            */}

            {/* Stats Overlay */}
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-white border border-white/5 flex items-center space-x-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">FPS</div>
                <div className="font-mono text-sm font-bold text-primary">{fps > 0 ? fps : '--'}</div>
            </div>

            {/* Connection Status Overlay */}
            {connectionStatus !== 'Open' && (
                <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
                    role="alert" 
                    aria-live="polite"
                >
                    <div className="glass-panel p-8 rounded-2xl text-center max-w-sm">
                        {connectionStatus === 'Closed' || connectionStatus === 'Uninstantiated' ? (
                            <>
                                <div className="mx-auto w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle size={24} aria-hidden="true" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Connection Lost</h3>
                                <p className="text-sm text-gray-400 mb-6">Unable to connect to the AI server. Please ensure the backend is running.</p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="btn-secondary w-full flex items-center justify-center"
                                    aria-label="Retry connection to server"
                                >
                                    <RefreshCw size={16} className="mr-2" aria-hidden="true" />
                                    Retry Connection
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-12 h-12 flex items-center justify-center mb-4">
                                    <Loader2 size={32} className="text-primary animate-spin" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">Connecting...</h3>
                                <p className="text-sm text-gray-500">Establishing secure link to neural engine</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebcamCapture;
