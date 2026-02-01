import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionCard } from './SessionCard';

describe('SessionCard', () => {
    const mockSession = {
        id: 1,
        exercise: 'Pushups',
        reps: 20,
        duration: 0,
        timestamp: 1672531200, // Jan 1 2023 00:00:00 GMT
    };

    it('renders session details correctly in compact mode', () => {
        render(<SessionCard session={mockSession} variant="compact" />);
        
        expect(screen.getByText('Pushups')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
        expect(screen.getByText('Reps')).toBeInTheDocument();
    });

    it('renders session details correctly in detailed mode', () => {
        render(<SessionCard session={mockSession} variant="detailed" />);
        
        expect(screen.getByText('Pushups')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('formats Plank exercise correctly', () => {
        const plankSession = { ...mockSession, exercise: 'Plank', reps: 60 };
        render(<SessionCard session={plankSession} />);
        
        expect(screen.getByText('60s')).toBeInTheDocument();
        expect(screen.getByText('Seconds')).toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', () => {
        const onDelete = vi.fn();
        render(<SessionCard session={mockSession} onDelete={onDelete} variant="detailed" />);
        
        const deleteBtn = screen.getByTitle('Delete Session');
        fireEvent.click(deleteBtn);
        
        expect(onDelete).toHaveBeenCalledWith(1);
    });
});
