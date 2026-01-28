
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import StatsPanel from './StatsPanel';

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
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={endWorkout}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold">{activeExercise} Session</h2>
                <div className="ml-auto flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
                    <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Open' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span>WS: {connectionStatus}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <WebcamCapture
                        onConnectionStatus={setConnectionStatus}
                        onPoseDataUpdate={setPoseData}
                    />
                </div>

                <div className="lg:col-span-1">
                    <StatsPanel
                        repData={poseData?.reps ? { rep_count: poseData.reps, form_quality_score: 85 } : undefined} // Mock score if missing
                        feedback={poseData?.feedback}
                        sessionTime={sessionTime}
                    />

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={endWorkout}
                            className="w-full btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/10"
                        >
                            End Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutView;
