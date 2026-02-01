import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCards } from './StatsCards';

describe('StatsCards', () => {
    const mockStats = {
        totalSessions: 42,
        totalReps: 1337,
        dayStreak: 5,
    };

    it('renders all stats correctly', () => {
        render(<StatsCards stats={mockStats} />);
        
        expect(screen.getByText('1337')).toBeInTheDocument();
        expect(screen.getByText('Total Reps')).toBeInTheDocument();
        
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('Sessions')).toBeInTheDocument();
        
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Day Streak')).toBeInTheDocument();
    });

    it('calculates level correctly based on streak', () => {
        // Level = floor(streak / 7) + 1
        // Streak 5 -> Lvl 1
        render(<StatsCards stats={mockStats} />);
        expect(screen.getByText('Lvl 1')).toBeInTheDocument();

        // Streak 15 -> Lvl 3
        const highStreakStats = { ...mockStats, dayStreak: 15 };
        render(<StatsCards stats={highStreakStats} />);
        expect(screen.getByText('Lvl 3')).toBeInTheDocument();
    });

    it('handles zero stats gracefully', () => {
        const zeroStats = {
            totalSessions: 0,
            totalReps: 0,
            dayStreak: 0,
        };
        render(<StatsCards stats={zeroStats} />);
        
        expect(screen.getAllByText('0')).toHaveLength(3); // Reps, Sessions, Streak
        expect(screen.getByText('Lvl 1')).toBeInTheDocument(); // Min level 1
    });
});
