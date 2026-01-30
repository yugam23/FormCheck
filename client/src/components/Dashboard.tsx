import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, TrendingUp, Trophy, ArrowUpRight, Activity, Clock, Dumbbell, Trash2, X, Medal, PieChart as PieIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Session } from '../types';

const API_URL = 'http://localhost:8000';

const Dashboard = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalReps: 0,
        dayStreak: 0,
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<{
        distribution: { name: string; value: number }[];
        prs: { exercise: string; reps: number }[];
    }>({ distribution: [], prs: [] });
    const [goal, setGoal] = useState(500); 
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState("500");
    
    const [showHistory, setShowHistory] = useState(false);
    const [historySessions, setHistorySessions] = useState<Session[]>([]);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

    const refreshData = async () => {
        try {
            // Fetch recent sessions for chart/feed
            const sessionRes = await fetch(`${API_URL}/api/sessions`);
            const sessionData = await sessionRes.json();
            setSessions(sessionData);
            processChartData(sessionData);

            // Fetch global stats (Totals + Streak)
            const statsRes = await fetch(`${API_URL}/api/stats`);
            const statsData = await statsRes.json();
            setStats({
                totalSessions: statsData.total_sessions,
                totalReps: statsData.total_reps,
                dayStreak: statsData.day_streak
            });

            // Fetch Analytics
            const analyticsRes = await fetch(`${API_URL}/api/analytics`);
            const analyticsData = await analyticsRes.json();
            setAnalytics(analyticsData);

            // Fetch Goal
            const goalRes = await fetch(`${API_URL}/api/settings/goal`);
            const goalData = await goalRes.json();
            setGoal(goalData.goal);
            setNewGoal(String(goalData.goal));

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const processChartData = (data: Session[]) => {
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
    };

    const handleExport = async () => {
        try {
            const res = await fetch(`${API_URL}/api/sessions?limit=-1`);
            const data: Session[] = await res.json();
            
            const csvContent = 
                "Date,Time,Exercise,Reps,Duration(s)\n" + 
                data.map(s => {
                    const d = new Date(s.timestamp * 1000);
                    return `${d.toLocaleDateString()},${d.toLocaleTimeString()},${s.exercise},${s.reps},${s.duration || 0}`;
                }).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `formcheck_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export data");
        }
    };
    
    const handleUpdateGoal = async () => {
        const g = parseInt(newGoal);
        if (isNaN(g) || g <= 0) return alert("Invalid Goal");
        try {
             await fetch(`${API_URL}/api/settings/goal`, {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({ goal: g })
             });
             setGoal(g);
             setIsEditingGoal(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteSession = async (id: number) => {
        if (!confirm('Are you sure you want to delete this session?')) return;
        try {
            const res = await fetch(`${API_URL}/api/sessions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                refreshData();
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
                refreshData();
                setHistorySessions([]);
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
                    <button onClick={handleExport} className="btn-primary text-sm py-2 flex items-center shadow-primary/20">
                        <ArrowUpRight size={16} className="mr-2" />
                        Export Data
                    </button>
                </div>
            </header>

            {/* Bento Grid Layout - 12 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24">
                
                {/* === LEFT COLUMN (MAIN STATS & CHARTS) === */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    
                    {/* Top Stats Row */}
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

                    {/* Chart Section */}
                    <div className="glass-panel p-6 rounded-3xl min-h-[350px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center">
                                <Activity size={20} className="mr-2 text-primary" />
                                Activity
                            </h3>
                            <button className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">Weekly</button>
                        </div>
                        <div className="h-[280px] w-full">
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
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="rgba(255,255,255,0.3)" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        dx={-10}
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

                    {/* Analytics Row (Pie & PRs) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Distribution */}
                        <div className="glass-panel p-6 rounded-3xl min-h-[300px] flex flex-col">
                            <h3 className="font-bold text-lg mb-6 flex items-center">
                                <PieIcon size={20} className="mr-2 text-primary" />
                                Distribution
                            </h3>
                            <div className="flex-1 w-full min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analytics.distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {analytics.distribution.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#09090b', 
                                                border: '1px solid rgba(255,255,255,0.1)', 
                                                borderRadius: '12px'
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* PRs */}
                        <div className="glass-panel p-6 rounded-3xl">
                             <h3 className="font-bold text-lg mb-6 flex items-center">
                                <Medal size={20} className="mr-2 text-amber-400" />
                                Personal Records
                            </h3>
                            <div className="space-y-3">
                                {analytics.prs.map((pr, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <span className="font-medium text-sm text-white/90">{pr.exercise}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold font-display text-white">{pr.reps}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Reps</span>
                                        </div>
                                    </div>
                                ))}
                                {analytics.prs.length === 0 && (
                                     <div className="text-center text-muted-foreground text-sm py-10 opacity-50">
                                        No records yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* === RIGHT COLUMN (SIDEBAR) === */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    
                    {/* Weekly Goal */}
                    <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center relative bg-gradient-to-br from-white/5 to-white/[0.02]">
                        <div className="w-full flex justify-between items-center mb-4 absolute top-6 px-6">
                            <h3 className="font-bold text-lg flex items-center">
                                <Trophy size={18} className="mr-2 text-primary" />
                                Weekly Goal
                            </h3>
                             <button 
                                onClick={() => setIsEditingGoal(true)}
                                className="text-xs text-muted-foreground hover:text-white transition-colors bg-white/10 px-2 py-1 rounded-md"
                            >
                                Edit
                            </button>
                        </div>

                        {isEditingGoal ? (
                            <div className="flex flex-col items-center gap-3 mt-12 animate-fade-in">
                                 <input 
                                    type="number" 
                                    value={newGoal} 
                                    onChange={(e) => setNewGoal(e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-xl w-32 text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    autoFocus
                                 />
                                 <div className="flex gap-2 w-full">
                                    <button onClick={handleUpdateGoal} className="flex-1 py-1.5 bg-primary text-black text-xs font-bold rounded-lg hover:bg-primary/90">Save</button>
                                    <button onClick={() => setIsEditingGoal(false)} className="flex-1 py-1.5 bg-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/20">Cancel</button>
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
                                        strokeDashoffset={565 - (Math.min(stats.totalReps, goal) / goal) * 565}
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
                                    <span className="text-5xl font-display font-bold text-white tracking-tighter">{Math.round((stats.totalReps / goal) * 100)}%</span>
                                    <span className="text-xs text-muted-foreground mt-2 font-medium bg-white/5 px-2 py-1 rounded-full">{stats.totalReps} / {goal} Reps</span>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground/50 mt-4 text-center max-w-[200px] leading-relaxed">
                            Keep pushing! You're making close to your weekly target.
                        </p>
                    </div>

                    {/* Recent Sets Sidebar */}
                    <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col min-h-[400px]">
                        <h3 className="font-bold text-lg mb-6 flex items-center">
                            <Clock size={20} className="mr-2 text-muted-foreground" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
                            {sessions.length === 0 ? (
                                <div className="text-center text-muted-foreground text-sm py-12 flex flex-col items-center opacity-50">
                                    <Clock size={32} className="mb-3 opacity-20" />
                                    No sessions yet.
                                </div>
                            ) : sessions.map((session) => (
                                <div key={session.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group relative pr-10">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSession(session.id!);
                                        }}
                                        className="absolute right-3 top-3 p-1.5 text-muted-foreground hover:text-red-400 hover:bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete Session"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">{session.exercise}</span>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-green-400 bg-green-400/10 border border-green-400/10">
                                            {session.reps} Reps
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                                        <span>{new Date(session.timestamp * 1000).toLocaleDateString()}</span>
                                        <span>{new Date(session.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={handleClearHistory}
                            className="w-full mt-6 text-xs font-medium text-center text-muted-foreground hover:text-red-400 transition-colors flex items-center justify-center gap-2 py-3 hover:bg-white/5 rounded-xl"
                        >
                            <Trash2 size={14} />
                            Clear History
                        </button>
                    </div>

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
                                                {session.duration && session.duration > 0 && <span className="block text-xs text-muted-foreground mt-1">{session.duration}s</span>}
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


