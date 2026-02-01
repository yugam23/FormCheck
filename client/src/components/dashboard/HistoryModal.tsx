import React from 'react';
import { Trash2 } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Session } from '../../types';

/**
 * Props for the HistoryModal component.
 */
interface HistoryModalProps {
    /** Whether the modal is currently open */
    isOpen: boolean;
    /** Callback to close the modal */
    onClose: () => void;
    /** Array of all workout sessions */
    sessions: Session[];
    /** Async callback to delete a specific session */
    onDeleteSession: (id: number) => Promise<void>;
    /** Async callback to clear all history */
    onClearHistory: () => Promise<void>;
}

/**
 * Modal dialog for viewing and managing complete workout history.
 * Displays detailed session cards and provides deletion controls.
 *
 * @param props - Component props containing modal state and handlers
 */
export const HistoryModal = React.memo<HistoryModalProps>(({ 
    isOpen, 
    onClose, 
    sessions, 
    onDeleteSession, 
    onClearHistory 
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Workout History"
            footer={
                <Button 
                    variant="danger" 
                    size="sm"
                    onClick={onClearHistory}
                    icon={<Trash2 size={14} />}
                >
                    Clear All History
                </Button>
            }
        >
            <div className="space-y-3">
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
        </Modal>
    );
});
