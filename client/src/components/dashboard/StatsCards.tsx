import React from 'react';
import { TrendingUp, Dumbbell, Calendar, Trophy } from 'lucide-react';

/**
 * Props for the StatsCards component.
 */
interface StatsCardsProps {
    stats: {
        totalSessions: number;
        totalReps: number;
        dayStreak: number;
    };
}

/**
 * Component to display high-level statistics: Total Reps, Total Sessions, and Day Streak.
 * Uses a bento-grid style layout.
 *
 * @param props - Component props containing stats data
 */
export const StatsCards = React.memo<StatsCardsProps>(({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Total Reps */}
            <div className="md:col-span-6 glass-panel p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-24 bg-primary/10 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Total Reps</p>
                        <h3 className="text-5xl font-display font-bold text-white mt-2">{stats.totalReps}</h3>
                    </div>
                    <div className="p-3 bg-white/5 text-primary rounded-2xl border border-white/5">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-bold flex items-center border border-primary/20">
                        <Dumbbell size={12} className="mr-1" />
                        Lifetime
                    </span>
                </div>
            </div>

            {/* Sessions & Streak */}
            <div className="md:col-span-6 grid grid-cols-2 gap-6">
                    <div className="glass-panel p-5 rounded-3xl flex flex-col justify-between hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                            <Calendar size={20} />
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">7 Days</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold text-white">{stats.totalSessions}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Sessions</p>
                    </div>
                </div>

                <div className="glass-panel p-5 rounded-3xl flex flex-col justify-between hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                            <Trophy size={20} />
                        </div>
                        <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">Lvl {Math.max(1, Math.floor(stats.dayStreak / 7) + 1)}</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold text-white">{stats.dayStreak}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Day Streak</p>
                    </div>
                </div>
            </div>
        </div>
    );
});
