import React from 'react';
import { Trash2, Dumbbell } from 'lucide-react';
import type { Session } from '../../types';

interface SessionCardProps {
    session: Session;
    onDelete?: (id: number) => void;
    variant?: 'compact' | 'detailed';
}

export const SessionCard: React.FC<SessionCardProps> = ({
    session,
    onDelete,
    variant = 'compact'
}) => {
    // Format metric based on exercise type
    const formatMetric = (exercise: string, reps: number) => {
        if (exercise === 'Plank') {
            return { value: `${reps}s`, unit: 'Seconds' }; // Changed unit to 'Seconds' for clarity
        }
        return { value: reps, unit: 'Reps' };
    };

    const metric = formatMetric(session.exercise, session.reps);
    const dateObj = new Date(session.timestamp * 1000);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete && session.id) {
            onDelete(session.id);
        }
    };

    if (variant === 'detailed') {
        return (
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group relative cursor-default">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-lg hidden sm:block">
                        <Dumbbell size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{session.exercise}</h4>
                        <p className="text-xs text-muted-foreground">
                            {dateStr} at {timeStr}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="block text-xl font-bold text-white">{metric.value}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{metric.unit}</span>
                         {/* Optional: Show duration for non-plank exercises if stored, though Plank uses reps field for duration currently */}
                    </div>
                    {onDelete && (
                        <button 
                            onClick={handleDelete}
                            className="p-2 text-muted-foreground hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Session"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Compact Variant (Sidebar)
    return (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group relative cursor-default">
            {onDelete && (
                <button 
                    onClick={handleDelete}
                    className="absolute right-2 top-2 p-1.5 text-muted-foreground hover:text-red-400 hover:bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Delete Session"
                >
                    <Trash2 size={14} />
                </button>
            )}
            
            <div className="flex flex-col">
                <span className="font-medium text-sm text-white/90">{session.exercise}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                    {dateStr}
                    <span className="mx-1">•</span>
                    {timeStr}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-display text-white">{metric.value}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{metric.unit}</span>
            </div>
        </div>
    );
};
