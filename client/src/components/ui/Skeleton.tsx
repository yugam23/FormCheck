import { cn } from '../../lib/utils';
import React from 'react';

/**
 * Basic Skeleton component for loading states.
 */
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => {
    return (
        <div 
            className={cn("animate-pulse bg-white/5 rounded-lg", className)} 
            style={style}
        />
    );
};

/**
 * Skeleton loader for the StatsCards component.
 */
export const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
    </div>
);

/**
 * Skeleton loader for the ActivityChart component.
 */
export const ChartSkeleton = () => {
    // Generate static random heights only once (or use fixed/pseudorandom values)
    // For simplicity, we can use a fixed pattern or just simple varying heights
    const heights = [40, 70, 30, 85, 50, 65, 45]; // Deterministic pattern

    return (
        <div className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col gap-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex-1 flex items-end gap-2 px-4 pb-4">
                {heights.map((h, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
            </div>
        </div>
    );
};
