import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

/**
 * Props for the DistributionChart component.
 */
interface DistributionChartProps {
    /** Array of distribution data objects (name: exercise, value: percentage/count) */
    data: { name: string; value: number }[];
    /** Array of color strings for the pie segments */
    colors: string[];
}

/**
 * Renders a pie chart showing the distribution of exercises performed.
 *
 * @param props - Component props containing data and color palette
 */
export const DistributionChart = React.memo<DistributionChartProps>(({ data, colors }) => {
    return (
        <Card className="min-h-[300px] flex flex-col">
            <CardHeader className="mb-6">
                <CardTitle>
                    <PieIcon size={20} className="mr-2 text-primary" />
                    Distribution
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 w-full min-h-[200px]">
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
            </CardContent>
        </Card>
    );
});
