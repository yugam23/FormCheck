// WeeklyGoal.tsx
//
// Circular progress indicator for weekly rep goal.
//
// Progress Visualization:
//   Uses SVG strokeDasharray/strokeDashoffset animation to create
//   an animated circular progress bar. The glow filter adds visual polish.
//
// Edit Mode:
//   Users can click "Edit" to enter a new goal target.
//   Goal is persisted via /api/settings/goal endpoint.
//
// Formula:
//   Progress % = (currentReps / goal) * 100
//   strokeDashoffset = circumference - (progress * circumference)

import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { Card } from '../ui/Card';

/**
 * Props for the WeeklyGoal component.
 */
interface WeeklyGoalProps {
    /** Current number of reps completed this week */
    currentReps: number;
    /** Target number of reps for the week */
    goal: number;
    /** Async callback to update the weekly goal */
    onUpdateGoal: (newGoal: number) => Promise<void>;
}

/**
 * Displays weekly goal progress with a circular progress indicator.
 * Allows the user to edit their weekly goal target.
 *
 * @param props - Component props containing goal data and update handler
 */
export const WeeklyGoal = React.memo<WeeklyGoalProps>(({ currentReps, goal, onUpdateGoal }) => {
    const toast = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(goal.toString());

    const handleSave = async () => {
        const val = parseInt(inputValue);
        if (isNaN(val) || val <= 0) {
            toast.warning("Goal must be a positive number.");
            return;
        }
        await onUpdateGoal(val);
        setIsEditing(false);
    };

    return (
        <Card className="p-8 flex flex-col items-center justify-center relative bg-gradient-to-br from-white/5 to-white/[0.02]">
            <div className="w-full flex justify-between items-center mb-4 absolute top-6 px-6">
                <h3 className="font-bold text-lg flex items-center">
                    <Trophy size={18} className="mr-2 text-primary" />
                    Weekly Goal
                </h3>
                <button
                    onClick={() => {
                        setInputValue(goal.toString());
                        setIsEditing(true);
                    }}
                    className="text-xs text-muted-foreground hover:text-white transition-colors bg-white/10 px-2 py-1 rounded-md"
                    aria-label="Edit weekly goal"
                >
                    Edit
                </button>
            </div>

            {isEditing ? (
                <div className="flex flex-col items-center gap-3 mt-12 animate-fade-in">
                    <input
                        type="number"
                        id="goal-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-xl w-32 text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                        autoFocus
                        aria-label="New goal"
                    />
                    <div className="flex gap-2 w-full">
                        <button onClick={handleSave} className="flex-1 py-1.5 bg-primary text-black text-xs font-bold rounded-lg hover:bg-primary/90">Save</button>
                        <button onClick={() => setIsEditing(false)} className="flex-1 py-1.5 bg-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/20">Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="relative w-56 h-56 mt-6 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="90" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                        <circle
                            cx="50%" cy="50%" r="90"
                            stroke="hsl(var(--primary))"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={565}
                            strokeDashoffset={565 - (Math.min(currentReps, goal) / goal) * 565}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                            filter="url(#glow)"
                        />
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-display font-bold text-white tracking-tighter">{Math.round((currentReps / goal) * 100)}%</span>
                        <span className="text-xs text-muted-foreground mt-2 font-medium bg-white/5 px-2 py-1 rounded-full">{currentReps} / {goal} Reps</span>
                    </div>
                </div>
            )}
            <p className="text-xs text-muted-foreground/50 mt-4 text-center max-w-[200px] leading-relaxed">
                Keep pushing! You're making close to your weekly target.
            </p>
        </Card>
    );
});
