import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Calendar, TrendingUp, Trophy, ArrowUpRight, Activity, Clock, Dumbbell, Trash2, X } from 'lucide-react';
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
    const [showHistory, setShowHistory] = useState(false);
    const [historySessions, setHistorySessions] = useState<Session[]>([]);

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

    const handleDeleteSession = async (id: number) => {
        if (!confirm('Are you sure you want to delete this session?')) return;
        try {
            const res = await fetch(`${API_URL}/api/sessions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                const updatedSessions = sessions.filter(s => s.id !== id);
                setSessions(updatedSessions);
                processStats(updatedSessions);
            }
        } catch (err) {
            console.error("Error deleting session:", err);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to delete ALL history? This cannot be undone.')) return;
        try {
            const res = await fetch(`${API_URL}/api/sessions`, { method: 'DELETE' });
            if (res.ok) {
                setSessions([]);
                setHistorySessions([]);
                processStats([]);
            }
        } catch (err) {
            console.error("Error clearing history:", err);
        }
    };

    const handleViewHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/api/sessions?limit=-1`);
            if (!res.ok) throw new Error('Failed to fetch history');
            const data = await res.json();
            setHistorySessions(data);
            setShowHistory(true);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-display font-bold text-white mb-2">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back, Athlete. Here is your performance overview.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleViewHistory} className="btn-secondary text-sm py-2">History</button>
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
                            <div key={session.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group relative pr-10">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSession(session.id!);
                                    }}
                                    className="absolute right-2 top-2 p-1.5 text-muted-foreground hover:text-red-400 hover:bg-white/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete Session"
                                >
                                    <Trash2 size={14} />
                                </button>
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
                    <button 
                        onClick={handleClearHistory}
                        className="w-full mt-4 text-xs font-medium text-center text-muted-foreground hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={14} />
                        Delete All History
                    </button>
                </div>
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[#09090b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-2xl font-display font-bold text-white">Workout History</h3>
                            <button 
                                onClick={() => setShowHistory(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-3">
                            {historySessions.length === 0 ? (
                                <div className="text-center text-muted-foreground py-12">
                                    <p>No workout history found.</p>
                                </div>
                            ) : (
                                historySessions.map((session) => (
                                    <div key={session.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group relative cursor-default">
                                         <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 text-primary rounded-lg">
                                                <Dumbbell size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white">{session.exercise}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(session.timestamp * 1000).toLocaleDateString()} at {new Date(session.timestamp * 1000).toLocaleTimeString()}
                                                </p>
                                            </div>
                                         </div>
                                         <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <span className="block text-xl font-bold text-white">{session.reps}</span>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Reps</span>
                                            </div>
                                            <button 
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if(!confirm('Delete this session?')) return;
                                                    try {
                                                        const res = await fetch(`${API_URL}/api/sessions/${session.id}`, { method: 'DELETE' });
                                                        if (res.ok) {
                                                            setHistorySessions(prev => prev.filter(s => s.id !== session.id));
                                                            // Update main dashboard list too if it's in there
                                                            setSessions(prev => prev.filter(s => s.id !== session.id));
                                                            // Use existing stats but subtracting
                                                            // Ideally we refetch stats but let's just do a basic update or refetch all
                                                        }
                                                    } catch(err) { console.error(err) }
                                                }}
                                                className="p-2 text-muted-foreground hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Session"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                         </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-2xl flex justify-end">
                            <button 
                                onClick={handleClearHistory}
                                className="text-xs text-red-400 hover:text-red-300 font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={14} />
                                Clear All History
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
