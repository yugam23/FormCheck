import React from 'react';
import { Timer, Activity, Zap } from 'lucide-react';

const StatsPanel = ({ repData, feedback, sessionTime }) => {
    // Format time mm:ss
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const score = repData?.form_quality_score || 0;

    // Dynamic color for score
    const getScoreColor = (s) => {
        if (s >= 90) return 'text-green-400';
        if (s >= 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mx-auto mt-6">
            {/* Rep Counter */}
            <div className="glass-card flex flex-col items-center justify-center p-6">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                    <Activity size={20} />
                    <span className="text-sm font-medium uppercase tracking-wider">Reps</span>
                </div>
                <div className="text-6xl font-bold font-mono text-white">
                    {repData?.rep_count || 0}
                </div>
            </div>

            {/* Form Quality Score */}
            <div className="glass-card flex flex-col items-center justify-center p-6">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                    <Zap size={20} />
                    <span className="text-sm font-medium uppercase tracking-wider">Form Score</span>
                </div>
                <div className={`text-6xl font-bold font-mono ${getScoreColor(score)}`}>
                    {Math.round(score)}
                </div>
            </div>

            {/* Session Timer */}
            <div className="glass-card flex flex-col items-center justify-center p-6">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                    <Timer size={20} />
                    <span className="text-sm font-medium uppercase tracking-wider">Duration</span>
                </div>
                <div className="text-5xl font-bold font-mono text-blue-400">
                    {formatTime(sessionTime || 0)}
                </div>
            </div>

            {/* Feedback Message Banner */}
            {feedback?.message && (
                <div className={`col-span-1 md:col-span-3 p-4 rounded-xl text-center font-bold text-xl transition-all duration-300
          ${feedback.color === 'green' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        feedback.color === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-800 text-gray-400'}
        `}>
                    {feedback.message}
                </div>
            )}
        </div>
    );
};

export default StatsPanel;
