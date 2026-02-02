// StatsPanel.tsx
//
// Real-time workout metrics display (HUD) shown during active exercise.
//
// Displays:
//   - Rep Count (or Hold Time for Plank)
//   - Form Quality Score (0-100, color-coded)
//   - Session Duration (MM:SS timer)
//   - Current AI Feedback message
//
// Layout:
//   On mobile: Horizontal 3-column grid
//   On desktop: Vertical stacked cards (sidebar orientation)
//
// Color Coding:
//   - Quality 90+: Green
//   - Quality 70-89: Yellow
//   - Quality <70: Red

import { Timer, Activity, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import type { RepData, FeedbackData } from '../types';

/**
 * Props for the StatsPanel component.
 */
interface StatsPanelProps {
    /** Real-time repetition data and form scores */
    repData?: RepData;
    /** AI feedback message and status color */
    feedback?: FeedbackData;
    /** Current session duration in seconds */
    sessionTime: number;
    /** Optional CSS class overrides */
    className?: string;
    /** Name of the current exercise */
    exerciseName: string;
}

/**
 * Heads-Up Display (HUD) panel for workout metrics.
 * Displays Rep Count, Form Quality Score, and Session Timer in a bento-grid layout.
 *
 * @param props - Component props
 */
const StatsPanel = ({ repData, feedback, sessionTime, className, exerciseName }: StatsPanelProps) => {
    // Format time mm:ss
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const score = repData?.form_quality_score || 0;
    const isPlank = exerciseName === 'Plank';

    return (
        <div className={cn("space-y-6", className)}>
             {/* HUD Header */}
             <div className="flex items-center space-x-2 mb-2 border-b border-primary/20 pb-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-primary tracking-[0.2em] uppercase">System Online</span>
             </div>

            <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
                {/* Rep Counter - Primary Stat */}
                <div className="glass-panel p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="absolute top-0 right-0 p-16 bg-primary/10 rounded-full blur-2xl opacity-20"></div>
                    <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                        <Activity size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{isPlank ? 'Hold Time' : 'Rep Count'}</span>
                    </div>
                    <div className="text-6xl font-display font-bold text-white tracking-tight">
                        {isPlank ? formatTime(repData?.rep_count || 0) : (repData?.rep_count || 0)}
                    </div>
                    <div className="h-1 w-full bg-white/10 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/80 w-1/3 animate-pulse"></div>
                    </div>
                </div>

                {/* Form Quality Score */}
                <div className="glass-panel p-5 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                             <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                                <Zap size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Quality</span>
                            </div>
                            <div className={cn(
                                "text-4xl font-display font-bold",
                                score >= 90 ? "text-green-400" : score >= 70 ? "text-yellow-400" : "text-red-400"
                            )}>
                                {Math.round(score)}
                                <span className="text-base text-muted-foreground ml-1 font-normal">/100</span>
                            </div>
                        </div>
                        {/* Mini Chart Visualization */}
                        <div className="flex items-end space-x-1 h-8">
                            {[40, 60, 45, 70, 85].map((h, i) => (
                                <div key={i} className="w-1 bg-white/10 rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Session Timer */}
                <div className="glass-panel p-5 relative group hover:border-amber-500/50 transition-colors">
                     <div className="flex flex-col">
                         <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                            <Timer size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Duration</span>
                        </div>
                        <div className="text-4xl font-mono text-white tracking-widest">
                            {formatTime(sessionTime || 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Message Banner */}
            {feedback?.message && (
                <div className={cn(
                    "p-4 rounded-lg bg-black/40 backdrop-blur-md border animate-fade-in",
                    feedback.color === 'green' ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"
                )}>
                    <div className="flex items-center space-x-3">
                        <div className={cn("w-1 h-8 rounded-full", feedback.color === 'green' ? "bg-green-500" : "bg-red-500")}></div>
                        <div>
                            <p className="text-xs font-mono opacity-70 uppercase tracking-wider mb-0.5">Analysis</p>
                            <p className="font-bold text-lg leading-none">{feedback.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsPanel;
