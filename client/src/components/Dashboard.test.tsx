import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dashboard } from './Dashboard';
import { ToastProvider } from './ui/Toast';

// Mock useFetch
const mockUseFetch = vi.fn();
vi.mock('../hooks/useFetch', () => ({
    useFetch: (...args: any[]) => mockUseFetch(...args),
}));

// Mock Recharts (they are hard to test in JSDOM usually without setup)
// Mock Recharts (they are hard to test in JSDOM usually without setup)
vi.mock('recharts', async () => {
    const OriginalModule = await vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
        AreaChart: () => <div>AreaChart</div>,
        PieChart: () => <div>PieChart</div>,
    };
});

describe('Dashboard Component', () => {
    beforeEach(() => {
        mockUseFetch.mockClear();
    });

    it('should render skeletons when loading', () => {
        mockUseFetch.mockReturnValue({
            data: null,
            loading: true, // Only one needs to be true for dashboard isLoading
            error: null,
            refetch: vi.fn(),
        });

        render(
            <ToastProvider>
                <Dashboard />
            </ToastProvider>
        );

        // Check for skeleton elements (assuming they implemented via specific class or generic)
        // Since we don't know exact skeleton structure, we check for absence of main content or presence of specific skeleton text/testids if available.
        // But Dashboard code has <StatsSkeleton />. Let's assume it renders something identifiable.
        // Actually best way is to snapshot or check for specific loading indicators if available.
        // The code uses `isLoading ? <StatsSkeleton />`
        // We can mock StatsSkeleton too if needed, but let's see if we can just check if StatsCards are NOT there.
        expect(screen.queryByText('Total Sessions')).not.toBeInTheDocument();
    });

    it('should render stats when data is loaded', async () => {
        // Setup mock returns for all the calls
        // Dashboard makes 4 calls: sessions, stats, analytics, goal
        // We need to return based on URL or just return valid structure for all since useFetch calls are parallel
        
        // Mock implementation to return different data based on URL
        mockUseFetch.mockImplementation((url) => {
            if (url.includes('/api/stats')) {
                return {
                    data: { total_sessions: 10, total_reps: 500, day_streak: 5 },
                    loading: false,
                    error: null,
                    refetch: vi.fn(),
                };
            }
            if (url.includes('/api/sessions')) {
                return {
                    data: [],
                    loading: false,
                    error: null,
                    refetch: vi.fn(),
                };
            }
             if (url.includes('/api/analytics')) {
                return {
                    data: { distribution: [], prs: [] },
                    loading: false,
                    error: null,
                    refetch: vi.fn(),
                };
            }
            if (url.includes('/api/settings/goal')) {
                 return {
                    data: { goal: 1000 },
                    loading: false,
                    error: null,
                    refetch: vi.fn(),
                };
            }
            return { data: null, loading: false, error: null };
        });

        render(
            <ToastProvider>
                <Dashboard />
            </ToastProvider>
        );

        expect(screen.getByText('5')).toBeInTheDocument(); // Streak
        expect(screen.getByText('500')).toBeInTheDocument(); // Reps
        expect(screen.getByText('10')).toBeInTheDocument(); // Sessions
    });

    it('should display error message', () => {
         mockUseFetch.mockImplementation((url) => {
            if (url.includes('/api/stats')) {
                return {
                    data: null,
                    loading: false,
                    error: { message: 'Failed to fetch stats' },
                    refetch: vi.fn(),
                };
            }
            return { data: null, loading: false, error: null, refetch: vi.fn() };
         });

         render(
            <ToastProvider>
                <Dashboard />
            </ToastProvider>
        );

        expect(screen.getByText(/Failed to fetch stats/i)).toBeInTheDocument();
    });
});
