import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { SessionCard } from './SessionCard';
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
export const RecentActivity: React.FC<RecentActivityProps> = ({ sessions, onDeleteSession, onClearHistory }) => {
    return (
        <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col min-h-0">
            <h3 className="font-bold text-lg mb-6 flex items-center">
                <Clock size={20} className="mr-2 text-muted-foreground" />
                Recent Activity
            </h3>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
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
            </div>
            <button
                onClick={onClearHistory}
                className="w-full mt-6 text-xs font-medium text-center text-muted-foreground hover:text-red-400 transition-colors flex items-center justify-center gap-2 py-3 hover:bg-white/5 rounded-xl"
            >
                <Trash2 size={14} />
                Clear History
            </button>
        </div>
    );
};
