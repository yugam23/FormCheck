
import { ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Calendar, TrendingUp, Trophy, ArrowUpRight, Activity, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const mockDailyProgress = [
    { day: 'Mon', score: 65 },
    { day: 'Tue', score: 72 },
    { day: 'Wed', score: 68 },
    { day: 'Thu', score: 85 },
    { day: 'Fri', score: 82 },
    { day: 'Sat', score: 90 },
    { day: 'Sun', score: 94 },
];

const mockRecentSets = [
    { id: 1, exercise: 'Pushups', reps: 15, score: 92, time: '2 mins ago' },
    { id: 2, exercise: 'Pushups', reps: 12, score: 88, time: '5 mins ago' },
    { id: 3, exercise: 'Squats', reps: 20, score: 95, time: '1 hour ago' },
];

const Dashboard = () => {
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
                
                {/* Main Stat: Form Score */}
                <div className="md:col-span-2 glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Average Form Score</p>
                            <h3 className="text-5xl font-display font-bold text-white mt-1">92.5</h3>
                        </div>
                        <div className="p-3 bg-primary/20 text-primary rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-bold flex items-center">
                            <ArrowUpRight size={12} className="mr-1" />
                            +12%
                        </span>
                        <span className="text-xs text-muted-foreground">vs. last week</span>
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
                        <h3 className="text-3xl font-display font-bold text-white">14</h3>
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
                            Form Consistency
                        </h3>
                        <div className="flex gap-2">
                            {['1W', '1M', '3M', 'YTD'].map((p) => (
                                <button key={p} className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                                    p === '1W' ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5"
                                )}>{p}</button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockDailyProgress}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
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
                                    domain={[0, 100]}
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
                                <ReferenceLine y={90} stroke="rgba(16, 185, 129, 0.5)" strokeDasharray="3 3" label={{ value: 'Target', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }} />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
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
                        {mockRecentSets.map((set) => (
                            <div key={set.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">{set.exercise}</span>
                                    <span className={cn(
                                        "text-xs font-bold px-1.5 py-0.5 rounded",
                                        set.score >= 90 ? "text-green-400 bg-green-400/10" : "text-amber-400 bg-amber-400/10"
                                    )}>{set.score}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{set.reps} Reps</span>
                                    <span>{set.time}</span>
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
