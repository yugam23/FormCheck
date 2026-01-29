import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Calendar, TrendingUp, Trophy, ArrowUpRight, Activity, Clock, Dumbbell } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import type { Session } from '../types';

const API_URL = 'http://localhost:8000';

const Dashboard = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalReps: 0,
        dayStreak: 0, // In a real app we'd calc this, for now mock or 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(`${API_URL}/api/sessions`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data: Session[] = await res.json();
                setSessions(data);
                processStats(data);
            } catch (err) {
                console.error("Error fetching sessions:", err);
            }
        };

        fetchSessions();
    }, []);

    const processStats = (data: Session[]) => {
        const totalSessions = data.length;
        const totalReps = data.reduce((acc, curr) => acc + curr.reps, 0);

        // Process Chart Data (Reps per day for last 7 days)
        const last7Days = new Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0]; // YYYY-MM-DD
        });

        const dailyReps: Record<string, number> = {};
        last7Days.forEach(day => dailyReps[day] = 0);

        data.forEach(session => {
            const date = new Date(session.timestamp * 1000).toISOString().split('T')[0];
            if (dailyReps[date] !== undefined) {
                dailyReps[date] += session.reps;
            }
        });

        const newChartData = last7Days.map(date => ({
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            reps: dailyReps[date]
        }));

        setChartData(newChartData);
        setStats({ totalSessions, totalReps, dayStreak: 0 });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-display font-bold text-white mb-2">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back, Athlete. Here is your performance overview.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary text-sm py-2">History</button>
                    <button className="btn-primary text-sm py-2 flex items-center shadow-primary/20">
                        <ArrowUpRight size={16} className="mr-2" />
                        Export Data
                    </button>
                </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Main Stat: Total Reps */}
                <div className="md:col-span-2 glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Total Reps</p>
                            <h3 className="text-5xl font-display font-bold text-white mt-1">{stats.totalReps}</h3>
                        </div>
                        <div className="p-3 bg-primary/20 text-primary rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-bold flex items-center">
                            <Dumbbell size={12} className="mr-1" />
                            Lifetime
                        </span>
                        <span className="text-xs text-muted-foreground">reps completed</span>
                    </div>
                </div>

                {/* Stat: Workout Count */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs text-muted-foreground">Last 7 days</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-display font-bold text-white">{stats.totalSessions}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Total Sessions</p>
                    </div>
                </div>

                 {/* Stat: Streak */}
                 <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                            <Trophy size={24} />
                        </div>
                        <span className="text-xs text-amber-500/80 font-bold uppercase">Level 5</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-display font-bold text-white">5</h3>
                        <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="md:col-span-3 glass-panel p-6 rounded-2xl min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center">
                            <Activity size={20} className="mr-2 text-primary" />
                            Activity (Reps)
                        </h3>
                        <div className="flex gap-2">
                            {['1W'].map((p) => (
                                <button key={p} className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                                    p === '1W' ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5"
                                )}>{p}</button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorReps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="day" 
                                    stroke="rgba(255,255,255,0.3)" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="rgba(255,255,255,0.3)" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: '#09090b', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="reps"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorReps)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="md:col-span-1 glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                        <Clock size={20} className="mr-2 text-muted-foreground" />
                        Recent Sets
                    </h3>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {sessions.length === 0 ? (
                            <div className="text-center text-muted-foreground text-sm py-4">No recent sessions found.</div>
                        ) : sessions.map((session) => (
                            <div key={session.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">{session.exercise}</span>
                                    <span className={cn(
                                        "text-xs font-bold px-1.5 py-0.5 rounded",
                                        "text-green-400 bg-green-400/10"
                                    )}>{session.reps} Reps</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{new Date(session.timestamp * 1000).toLocaleDateString()}</span>
                                    <span>{new Date(session.timestamp * 1000).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-xs font-medium text-center text-muted-foreground hover:text-white transition-colors">
                        View All History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
