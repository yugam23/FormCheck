// WorkoutView.tsx
//
// Real-time workout session orchestrator.
//
// This is the core user experience—the active workout with webcam feedback.
// It coordinates all real-time components:
//   - WebcamCapture: Camera stream and WebSocket communication
//   - StatsPanel: Live rep count and feedback display
//   - VoiceFeedback: Audio cues for form corrections
//
// Session Lifecycle:
//   1. User lands here from HomeView with exercise type in router state
//   2. WebSocket connects automatically (via WebcamCapture)
//   3. User clicks "Start Session" to begin sending frames
//   4. User clicks "End Session" to save data and navigate to dashboard
//
// Data Flow:
//   WebcamCapture -> (pose data) -> this component -> StatsPanel
//                 -> (feedback) -> VoiceFeedback hook -> audio

// Session Lifecycle State Machine:
//
// ┌──────────────┐
// │ Page Load    │
// └──────┬───────┘
//        │
//        ▼
// ┌──────────────┐  User clicks      ┌──────────────┐
// │  READY       │─────"Start"──────►│   ACTIVE     │
// │              │                   │              │
// │ - Camera on  │                   │ - Sending    │
// │ - WS open    │                   │   frames     │
// │ - Timer: 0   │                   │ - Timer: up  │
// └──────────────┘                   │ - Reps: ++   │
//                                    └──────┬───────┘
//                                           │ User clicks
//                                           │ "End"
//                                           ▼
//                                    ┌──────────────┐
//                                    │   SAVING     │
//                                    │              │
//                                    │ - POST /api  │
//                                    │ - Loading... │
//                                    └──────┬───────┘
//                                           │
//                                           ▼
//                                    ┌──────────────┐
//                                    │  Navigate    │
//                                    │  Dashboard   │
//                                    └──────────────┘
//
// State Persistence:
//   - Reps/Time: Lost on navigation (intentional, fresh start per session)
//   - Exercise: Passed via router state from HomeView
//   - WS connection: Shared across app (react-use-websocket share: true)

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Loader2 } from 'lucide-react';
import { useVoiceFeedback } from '../hooks/useVoiceFeedback';
import { useToast } from './ui/Toast';
import WebcamCapture from './WebcamCapture';
import StatsPanel from './StatsPanel';
import { cn } from '../lib/utils';
import type { PoseData } from '../types';
import { handleApiResponse, ApiError } from '../lib/errorHandler';

import { API_URL } from '../lib/constants';

/**
 * Main workout view that orchestrates the real-time exercise session.
 *
 * Responsibilities:
 * - Manages WebSocket connection state via WebcamCapture
 * - Handles session timer and lifecycle (Start/End)
 * - Coordinates voice feedback (useVoiceFeedback)
 * - Displays real-time stats (StatsPanel)
 * - Saves session data to backend on completion
 *
 * @example
 * ```tsx
 * <WorkoutView />
 * ```
 */
const WorkoutView = () => {
    const toast = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const activeExercise = location.state?.exercise || 'Unknown Exercise';
    
    const [connectionStatus, setConnectionStatus] = useState('Connecting');
    const [poseData, setPoseData] = useState<PoseData | null>(null);
    const [sessionTime, setSessionTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { speak } = useVoiceFeedback();
    const prevRepsRef = useRef(0);

    useEffect(() => {
        if (poseData) {
            // Rep Counting Voice
            if (poseData.reps && poseData.reps > prevRepsRef.current) {
                speak(poseData.reps.toString(), true);
                prevRepsRef.current = poseData.reps;
            }
            
            // Feedback Voice
            if (poseData.feedback?.message) {
                 const msg = poseData.feedback.message;
                 if (msg !== 'READY' && msg !== 'REP COMPLETE' && msg !== 'GO DOWN' && msg !== 'START') {
                    // Filter out common status messages to reduce noise, enable specific ones
                    speak(msg);
                 }
            }
        }
    }, [poseData, speak]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isSessionActive && timerActive) {
            interval = setInterval(() => setSessionTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isSessionActive, timerActive]);

    const startWorkout = () => {
        setIsSessionActive(true);
        setTimerActive(true);
        setSessionTime(0);
        speak("Session started", true);
    };

    const endWorkout = async () => {
        if (isEnding || isSaving) return;
        setIsEnding(true);
        
        setIsSessionActive(false);
        setTimerActive(false);
        speak("Session ended", true);

        // Save session data
        if (poseData?.reps && poseData.reps > 0) {
            setIsSaving(true);
            try {
                const response = await fetch(`${API_URL}/api/save-session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        exercise: activeExercise,
                        reps: poseData.reps,
                        duration: sessionTime,
                    }),
                });
                await handleApiResponse(response);
            } catch (err) {
                console.error("Failed to save session:", err);
                const message = err instanceof ApiError ? err.message : "Failed to save workout data";
                toast.error(message);
            } finally {
                setIsSaving(false);
            }
        }

        // Use setTimeout to ensure state updates flush and navigation occurs
        // This prevents race conditions where the component might be stuck in a re-render loop
        setTimeout(() => {
            navigate('/dashboard');
        }, 100);
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                        disabled={isSaving}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white">{activeExercise}</h2>
                        <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground mt-1">
                            <span>LIVE SESSION</span>
                            <span className="text-primary">•</span>
                            <span>{isSessionActive ? "AI ANALYZER ACTIVE" : "READY TO START"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                     <div className={cn(
                        "px-3 py-1.5 rounded-full border flex items-center space-x-2 text-xs font-mono",
                        connectionStatus === 'Open' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                     )}>
                        <div className={cn("w-2 h-2 rounded-full", connectionStatus === 'Open' ? "bg-green-500 animate-pulse" : "bg-red-500")}></div>
                        <span>STATUS: {connectionStatus.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
                {/* Visualizer Feed */}
                <div className="lg:col-span-9 relative">
                    <div className="h-full w-full rounded-2xl overflow-hidden glass-panel border-white/10 bg-black/40 shadow-2xl relative group">
                        {/* Corner decorative elements */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-lg z-20"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-lg z-20"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-lg z-20"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-lg z-20"></div>
                        
                        <div className="absolute inset-0 flex items-center justify-center p-1">
                             <WebcamCapture
                                activeExercise={activeExercise}
                                onConnectionStatus={setConnectionStatus}
                                onPoseDataUpdate={setPoseData}
                                poseData={poseData}
                                sessionActive={isSessionActive}
                            />
                        </div>
                    </div>
                </div>

                {/* Control Deck */}
                <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-6">
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <StatsPanel
                            repData={poseData?.reps ? { rep_count: poseData.reps, form_quality_score: 85 } : undefined} // Mock score if missing
                            feedback={poseData?.feedback}
                            sessionTime={sessionTime}
                            exerciseName={activeExercise}
                        />
                    </div>

                    {!isSessionActive ? (
                        <button
                            onClick={startWorkout}
                            className="w-full btn-primary bg-green-500 hover:bg-green-400 text-black flex items-center justify-center space-x-2 py-4 shadow-glow-primary"
                        >
                            <span className="font-bold">START SESSION</span>
                        </button>
                    ) : (
                        <button
                            onClick={endWorkout}
                            disabled={isSaving}
                            className="w-full btn-secondary bg-red-500/5 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 flex items-center justify-center space-x-2 py-4"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <LogOut size={18} />
                                    <span>End Session</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutView;
