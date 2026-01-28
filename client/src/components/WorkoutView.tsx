
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import StatsPanel from './StatsPanel';
import { cn } from '../lib/utils';

const WorkoutView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const activeExercise = location.state?.exercise || 'Unknown Exercise';
    
    const [connectionStatus, setConnectionStatus] = useState('Connecting');
    const [poseData, setPoseData] = useState<any>(null);
    const [sessionTime, setSessionTime] = useState(0);
    const [timerActive, setTimerActive] = useState(true);

    useEffect(() => {
        let interval: any;
        if (timerActive) {
            interval = setInterval(() => setSessionTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive]);

    const endWorkout = () => {
        setTimerActive(false);
        navigate('/dashboard');
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={endWorkout}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white">{activeExercise}</h2>
                        <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground mt-1">
                            <span>LIVE SESSION</span>
                            <span className="text-primary">•</span>
                            <span>AI ANALYZER ACTIVE</span>
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
                                onConnectionStatus={setConnectionStatus}
                                onPoseDataUpdate={setPoseData}
                                poseData={poseData}
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
                        />
                    </div>

                    <button
                        onClick={endWorkout}
                        className="w-full btn-secondary bg-red-500/5 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 flex items-center justify-center space-x-2 py-4"
                    >
                        <LogOut size={18} />
                        <span>End Session</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutView;
