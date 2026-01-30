import React from 'react';
import { Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface ChartDataPoint {
    day: string;
    reps: number;
}

interface ActivityChartProps {
    data: ChartDataPoint[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
    return (
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
                    <AreaChart data={data}>
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
    );
};
