import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { Session } from '../../types';

/**
 * Props for the RecentActivity component.
 */
interface RecentActivityProps {
    /** Array of recent workout sessions */
    sessions: Session[];
    /** Callback to delete a specific session */
    onDeleteSession: (id: number) => void;
    /** Callback to clear all history */
    onClearHistory: () => void;
}

/**
 * Sidebar component displaying a list of recent workout activities.
 * Provides options to delete individual sessions or clear all history.
 *
 * @param props - Component props containing sessions and handlers
 */
export const RecentActivity = React.memo<RecentActivityProps>(({ sessions, onDeleteSession, onClearHistory }) => {
    return (
        <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="mb-6">
                <CardTitle>
                    <Clock size={20} className="mr-2 text-muted-foreground" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {sessions.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-12 flex flex-col items-center opacity-50">
                        <Clock size={32} className="mb-3 opacity-20" />
                        No sessions yet.
                    </div>
                ) : sessions.map((session) => (
                    <SessionCard
                        key={session.id}
                        session={session}
                        onDelete={onDeleteSession}
                        variant="compact"
                    />
                ))}
            </CardContent>
            <button
                onClick={onClearHistory}
                className="w-full mt-6 text-xs font-medium text-center text-muted-foreground hover:text-red-400 transition-colors flex items-center justify-center gap-2 py-3 hover:bg-white/5 rounded-xl"
            >
                <Trash2 size={14} />
                Clear History
            </button>
        </Card>
    );
});
