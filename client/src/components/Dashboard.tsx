
import { ArrowUpRight, AlertCircle, X } from 'lucide-react';
import { useToast } from './ui/Toast';
import { useEffect, useState, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import type { Session } from '../types';
import { ApiError, handleApiResponse } from '../lib/errorHandler';

interface StatsResponse {
    total_sessions: number;
    total_reps: number;
    day_streak: number;
}

interface AnalyticsResponse {
    distribution: { name: string; value: number }[];
    prs: { exercise: string; reps: number }[];
}

interface GoalResponse {
    goal: number;
}
import { StatsCards } from './dashboard/StatsCards';
import { ActivityChart } from './dashboard/ActivityChart';
import { DistributionChart } from './dashboard/DistributionChart';
import { PersonalRecords } from './dashboard/PersonalRecords';
import { WeeklyGoal } from './dashboard/WeeklyGoal';
import { RecentActivity } from './dashboard/RecentActivity';
import { HistoryModal } from './dashboard/HistoryModal';
import { StatsSkeleton, ChartSkeleton } from './ui/Skeleton';
import { Loader2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

import { API_URL, DEFAULT_WEEKLY_GOAL } from '../lib/constants';

/**
 * Dashboard main view displaying workout analytics and statistics.
 *
 * Features:
 * - Real-time session tracking with live updates
 * - 7-day activity charts (ActivityChart)
 * - Exercise distribution analytics (DistributionChart)
 * - Personal records tracking (PersonalRecords)
 * - Weekly goal progress with editable target (WeeklyGoal)
 * - Recent activity feed and full history management
 *
 * @example
 * ```tsx
 * <Dashboard />
 * ```
 */
export const Dashboard: React.FC = () => {
    const toast = useToast();
    
    // Data Fetching
    const { 
        data: sessionsData, 
        loading: loadingSessions, 
        error: errorSessions, 
        refetch: refetchSessions 
    } = useFetch<Session[]>(`${API_URL}/api/sessions`);

    const { 
        data: statsData, 
        loading: loadingStats, 
        error: errorStats,
        refetch: refetchStats 
    } = useFetch<StatsResponse>(`${API_URL}/api/stats`);

    const {
        data: analyticsData,
        loading: loadingAnalytics,
        error: errorAnalytics,
        refetch: refetchAnalytics
    } = useFetch<AnalyticsResponse>(`${API_URL}/api/analytics`);

    const {
        data: goalData,
        loading: loadingGoal,
        error: errorGoal,
        refetch: refetchGoal
    } = useFetch<GoalResponse>(`${API_URL}/api/settings/goal`);

    // Derived State
    const sessions = useMemo(() => sessionsData || [], [sessionsData]);
    const stats = useMemo(() => ({
        totalSessions: statsData?.total_sessions || 0,
        totalReps: statsData?.total_reps || 0,
        dayStreak: statsData?.day_streak || 0,
    }), [statsData]);
    const analytics = useMemo(() => analyticsData || { distribution: [], prs: [] }, [analyticsData]);
    
    // Local goal state for updates
    const [goal, setGoal] = useState(DEFAULT_WEEKLY_GOAL);
    
    // Sync goal from server
    useEffect(() => {
        if (goalData) setGoal(goalData.goal);
    }, [goalData]);

    const [showHistory, setShowHistory] = useState(false);
    // Use useFetch for history (lazy load)
    const {
         data: historySessionsData,
         refetch: fetchHistory
    } = useFetch<Session[]>(`${API_URL}/api/sessions?limit=-1`, { immediate: false });
    
    // Combined Loading & Error State
    const isLoading = loadingSessions || loadingStats || loadingAnalytics || loadingGoal;
    const [manualError, setManualError] = useState<string | null>(null);
    const error = manualError || 
        (errorSessions?.message ? `Sessions: ${errorSessions.message}` : null) ||
        (errorStats?.message ? `Stats: ${errorStats.message}` : null) ||
        (errorAnalytics?.message ? `Analytics: ${errorAnalytics.message}` : null) ||
        (errorGoal?.message ? `Goal: ${errorGoal.message}` : null);
    
    const [isExporting, setIsExporting] = useState(false);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

    const leftColRef = useRef<HTMLDivElement>(null);
    const [rightColHeight, setRightColHeight] = useState<number | undefined>(undefined);

    const chartData = useMemo(() => {
        // Process Chart Data (Reps per day for last 7 days)
        const last7Days = new Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0]; // YYYY-MM-DD
        });

        const dailyReps: Record<string, number> = {};
        last7Days.forEach(day => dailyReps[day] = 0);

        sessions.forEach(session => {
            const date = new Date(session.timestamp * 1000).toISOString().split('T')[0];
            if (dailyReps[date] !== undefined) {
                dailyReps[date] += session.reps;
            }
        });

        return last7Days.map(date => ({
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            reps: dailyReps[date]
        }));
    }, [sessions]);

    const refreshData = useCallback(() => {
        setManualError(null);
        refetchSessions();
        refetchStats();
        refetchAnalytics();
        refetchGoal();
    }, [refetchSessions, refetchStats, refetchAnalytics, refetchGoal]);

    useEffect(() => {
        refreshData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync heights
    useLayoutEffect(() => {
        const updateHeight = () => {
            if (window.innerWidth >= 768 && leftColRef.current) {
                setRightColHeight(leftColRef.current.offsetHeight);
            } else {
                setRightColHeight(undefined);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            updateHeight();
        });

        if (leftColRef.current) {
            resizeObserver.observe(leftColRef.current);
        }
        
        window.addEventListener('resize', updateHeight);
        updateHeight(); // Call once immediately

        return () => {
             resizeObserver.disconnect();
             window.removeEventListener('resize', updateHeight);
        };
    }, [stats, chartData, analytics]); // Re-setup if data structure radically changes, but ResizeObserver handles size changes

    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const res = await fetch(`${API_URL}/api/sessions?limit=-1`);
            const data = await handleApiResponse<Session[]>(res);
            
            const csvContent = 
                "Date,Time,Exercise,Reps,Duration(s)\n" + 
                data.map(s => {
                    const d = new Date(s.timestamp * 1000);
                    return `${d.toLocaleDateString()},${d.toLocaleTimeString()},${s.exercise},${s.reps},${s.duration || 0}`;
                }).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `formcheck_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Export successful!");
        } catch (err) {
            console.error("Export failed", err);
            const message = err instanceof ApiError 
                ? `Export failed: ${err.message}`
                : 'Failed to export data. Please try again.';
            toast.error(message);
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleUpdateGoal = async (g: number) => {
        try {
             const res = await fetch(`${API_URL}/api/settings/goal`, {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({ goal: g })
             });
             await handleApiResponse(res);
             setGoal(g);
             toast.success("Weekly goal updated!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to update goal");
        }
    };

    const handleDeleteSession = async (id: number) => {
        if (!confirm('Are you sure you want to delete this session?')) return;
        try {
            const res = await fetch(`${API_URL}/api/sessions/${id}`, { method: 'DELETE' });
            await handleApiResponse(res);
            refreshData();
            toast.success("Session deleted successfully");
        } catch (err) {
            console.error("Error deleting session:", err);
            toast.error("Failed to delete session");
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to delete ALL history? This cannot be undone.')) return;
        try {
            const res = await fetch(`${API_URL}/api/sessions`, { method: 'DELETE' });
            await handleApiResponse(res);
            fetchHistory(); // Refetch history
            refreshData();
            toast.success("History cleared successfully");
        } catch (err) {
            console.error("Error clearing history:", err);
            toast.error("Failed to clear history");
        }
    };

    const handleDeleteHistorySession = async (id: number) => {
        if (!confirm('Are you sure you want to delete this session?')) return;
        try {
            const res = await fetch(`${API_URL}/api/sessions/${id}`, { method: 'DELETE' });
            await handleApiResponse(res);
            fetchHistory(); // Refetch history
            refreshData();
            toast.success("Session deleted successfully");
        } catch (err) {
            console.error("Error deleting session:", err);
            toast.error("Failed to delete session");
        }
    };

    const handleViewHistory = () => {
        fetchHistory();
        setShowHistory(true);
    };

    // Format time helper reuse/move out if commonly used


    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* ... Header content ... */}
                <div>
                    <h2 className="text-4xl font-display font-bold text-white mb-2">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back, Athlete. Here is your performance overview.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleViewHistory} className="btn-secondary text-sm py-2">History</button>
                    <button onClick={handleExport} disabled={isExporting || isLoading} className="btn-primary text-sm py-2 flex items-center shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isExporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <ArrowUpRight size={16} className="mr-2" />}
                        {isExporting ? 'Exporting...' : 'Export Data'}
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                    <button onClick={() => setManualError(null)} className="ml-auto hover:bg-white/10 p-1 rounded-lg">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Bento Grid Layout - 12 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24">
                
                {/* === LEFT COLUMN (MAIN STATS & CHARTS) === */}
                <div ref={leftColRef} className="md:col-span-8 flex flex-col gap-6 h-full">
                    
                    {/* Top Stats Row */}
                    {isLoading ? <StatsSkeleton /> : <StatsCards stats={stats} />}

                    {/* Chart Section */}
                    {isLoading ? <ChartSkeleton /> : <ActivityChart data={chartData} />}

                    {/* Analytics Row (Pie & PRs) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Distribution */}
                        <DistributionChart data={analytics.distribution} colors={COLORS} />

                        {/* PRs */}
                        <PersonalRecords prs={analytics.prs} />
                    </div>

                </div>

                {/* === RIGHT COLUMN (SIDEBAR) === */}
                <div className="md:col-span-4 flex flex-col gap-6 overflow-hidden" style={{ height: rightColHeight }}>
                    
                    {/* Weekly Goal */}
                    <WeeklyGoal 
                        currentReps={stats.totalReps} 
                        goal={goal} 
                        onUpdateGoal={handleUpdateGoal} 
                    />

                    {/* Recent Sets Sidebar */}
                    <RecentActivity 
                        sessions={sessions} 
                        onDeleteSession={handleDeleteSession} 
                        onClearHistory={handleClearHistory} 
                    />

                </div>
            </div>

            {/* History Modal */}
            <HistoryModal 
                isOpen={showHistory} 
                onClose={() => setShowHistory(false)} 
                sessions={historySessionsData || []} 
                onDeleteSession={handleDeleteHistorySession} 
                onClearHistory={handleClearHistory} 
            />
        </div>
    );
};

export default Dashboard;
