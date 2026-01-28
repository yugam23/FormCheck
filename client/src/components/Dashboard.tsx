
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, Award } from 'lucide-react';

const mockData = [
    { name: 'Set 1', score: 85 },
    { name: 'Set 2', score: 88 },
    { name: 'Set 3', score: 92 },
    { name: 'Set 4', score: 90 },
    { name: 'Set 5', score: 95 },
];

const Dashboard = () => {
    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Your Progress</h2>
                    <p className="text-gray-400">Analysis of your recent workout performance</p>
                </div>
                <button className="btn-secondary">Export Data</button>
            </header>

            {/* Stats Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-green-400 text-sm font-bold">+12%</span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Average Form Score</h3>
                    <p className="text-3xl font-bold text-white mt-1">92.5</p>
                </div>

                <div className="glass-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                            <Calendar size={24} />
                        </div>
                        <span className="text-gray-500 text-sm">Last 7 days</span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Total Workouts</h3>
                    <p className="text-3xl font-bold text-white mt-1">14</p>
                </div>

                <div className="glass-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                            <Award size={24} />
                        </div>
                        <span className="text-purple-400 text-sm font-bold">Level 5</span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">Streak</h3>
                    <p className="text-3xl font-bold text-white mt-1">5 Days</p>
                </div>
            </div>

            {/* Main Chart */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-6">Form Quality Trend</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00FF94" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#666" />
                            <YAxis stroke="#666" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#00FF94' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#00FF94"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
