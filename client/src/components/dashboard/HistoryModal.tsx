import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { SessionCard } from './SessionCard';
import type { Session } from '../../types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: Session[];
    onDeleteSession: (id: number) => Promise<void>;
    onClearHistory: () => Promise<void>;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
    isOpen, 
    onClose, 
    sessions, 
    onDeleteSession, 
    onClearHistory 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#09090b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-2xl font-display font-bold text-white">Workout History</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-3">
                    {sessions.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                            <p>No workout history found.</p>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                variant="detailed"
                                onDelete={onDeleteSession}
                            />
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={onClearHistory}
                        className="text-xs text-red-400 hover:text-red-300 font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={14} />
                        Clear All History
                    </button>
                </div>
            </div>
        </div>
    );
};
