import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DistributionChartProps {
    data: { name: string; value: number }[];
    colors: string[];
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ data, colors }) => {
    return (
        <div className="glass-panel p-6 rounded-3xl min-h-[300px] flex flex-col">
            <h3 className="font-bold text-lg mb-6 flex items-center">
                <PieIcon size={20} className="mr-2 text-primary" />
                Distribution
            </h3>
            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(0,0,0,0.2)" />
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
    );
};
