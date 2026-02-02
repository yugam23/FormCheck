// PersonalRecords.tsx
//
// Personal best display for each exercise type.
//
// Data:
//   PRs are calculated server-side via /api/analytics endpoint.
//   Each PR represents the maximum reps (or time for Plank) in a single session.
//
// Formatting:
//   Uses formatMetric() to handle time-based exercises (Plank shows MM:SS)
//   vs rep-based exercises (Pushups shows count).
//
// Empty State:
//   Shows "No records yet" message when user has no completed sessions.

import React from 'react';
import { Medal } from 'lucide-react';
import { formatMetric } from '../../lib/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

/**
 * Props for the PersonalRecords component.
 */
interface PersonalRecordsProps {
    /** Array of personal record objects (exercise name and max reps) */
    prs: { exercise: string; reps: number }[];
}

/**
 * Displays a list of personal records (PRs) for each exercise.
 * Formats metrics dynamically based on exercise type (time vs reps).
 *
 * @param props - Component props containing PR data
 */
export const PersonalRecords = React.memo<PersonalRecordsProps>(({ prs }) => {
    return (
        <Card>
            <CardHeader className="mb-6">
                <CardTitle>
                    <Medal size={20} className="mr-2 text-amber-400" />
                    Personal Records
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {prs.map((pr, i) => {
                    const metric = formatMetric(pr.exercise, pr.reps);
                    return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <span className="font-medium text-sm text-white/90">{pr.exercise}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold font-display text-white">{metric.value}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{metric.unit}</span>
                        </div>
                    </div>
                    );
                })}
                {prs.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-10 opacity-50">
                        No records yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
