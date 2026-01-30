
import { ArrowUpRight, AlertCircle, X } from 'lucide-react';
import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import type { Session } from '../types';
import { ApiError, handleApiResponse } from '../lib/errorHandler';
import { StatsCards } from './dashboard/StatsCards';
import { ActivityChart, type ChartDataPoint } from './dashboard/ActivityChart';
import { DistributionChart } from './dashboard/DistributionChart';
import { PersonalRecords } from './dashboard/PersonalRecords';
import { WeeklyGoal } from './dashboard/WeeklyGoal';
import { RecentActivity } from './dashboard/RecentActivity';
import { HistoryModal } from './dashboard/HistoryModal';

const API_URL = 'http://localhost:8000';

const Dashboard = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalReps: 0,
        dayStreak: 0,
    });

    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [analytics, setAnalytics] = useState<{
        distribution: { name: string; value: number }[];
        prs: { exercise: string; reps: number }[];
    }>({ distribution: [], prs: [] });
    const [goal, setGoal] = useState(500);
    
    const [showHistory, setShowHistory] = useState(false);
    const [historySessions, setHistorySessions] = useState<Session[]>([]);
    const [error, setError] = useState<string | null>(null);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

    const leftColRef = useRef<HTMLDivElement>(null);
    const [rightColHeight, setRightColHeight] = useState<number | undefined>(undefined);

    const processChartData = useCallback((data: Session[]) => {
        // Process Chart Data (Reps per day for last 7 days)
        const last7Days = new Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0]; // YYYY-MM-DD
        });

        const dailyReps: Record<string, number> = {};
        last7Days.forEach(day => dailyReps[day] = 0);

        data.forEach(session => {
            const date = new Date(session.timestamp * 1000).toISOString().split('T')[0];
            if (dailyReps[date] !== undefined) {
                dailyReps[date] += session.reps;
            }
        });

        const newChartData = last7Days.map(date => ({
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            reps: dailyReps[date]
        }));

        setChartData(newChartData);
    }, []);

    const refreshData = useCallback(async () => {
        setError(null);
        try {
            // Fetch recent sessions for chart/feed
            const sessionRes = await fetch(`${API_URL}/api/sessions`);
            const sessionData = await handleApiResponse<Session[]>(sessionRes);
            setSessions(sessionData);
            processChartData(sessionData);

            // Fetch global stats (Totals + Streak)
            const statsRes = await fetch(`${API_URL}/api/stats`);
            const statsData = await handleApiResponse<{
                total_sessions: number;
                total_reps: number;
                day_streak: number;
            }>(statsRes);
            
            setStats({
                totalSessions: statsData.total_sessions,
                totalReps: statsData.total_reps,
                dayStreak: statsData.day_streak
            });

            // Fetch Analytics
            const analyticsRes = await fetch(`${API_URL}/api/analytics`);
            const analyticsData = await handleApiResponse<{
                distribution: { name: string; value: number }[];
                prs: { exercise: string; reps: number }[];
            }>(analyticsRes);
            setAnalytics(analyticsData);

            // Fetch Goal
            const goalRes = await fetch(`${API_URL}/api/settings/goal`);
            const goalData = await handleApiResponse<{ goal: number }>(goalRes);
            setGoal(goalData.goal);

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            const message = err instanceof ApiError 
                ? `Failed to load data: ${err.message}`
                : 'An unexpected error occurred while loading dashboard data.';
            setError(message);
        }
    }, [processChartData]);

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
        } catch (err) {
            console.error("Export failed", err);
            const message = err instanceof ApiError 
                ? `Export failed: ${err.message}`
                : 'Failed to export data. Please try again.';
            alert(message); // Using alert until Toast system is implemented in Phase 5
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
        } catch (e) {
            console.error(e);
            alert("Failed to update goal");
        }
    };

    const handleDeleteSession = async (id: number) => {
        if (!confirm('Are you sure you want to delete this session?')) return;
        try {
            const res = await fetch(`${API_URL}/api/sessions/${id}`, { method: 'DELETE' });
            await handleApiResponse(res);
            refreshData();
        } catch (err) {
            console.error("Error deleting session:", err);
            alert("Failed to delete session");
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to delete ALL history? This cannot be undone.')) return;
        try {
            const res = await fetch(`${API_URL}/api/sessions`, { method: 'DELETE' });
            await handleApiResponse(res);
            refreshData();
            setHistorySessions([]);
        } catch (err) {
            console.error("Error clearing history:", err);
            alert("Failed to clear history");
        }
    };

    const handleDeleteHistorySession = async (id: number) => {
        if (!confirm('Are you sure you want to delete this session?')) return;
        try {
            const res = await fetch(`${API_URL}/api/sessions/${id}`, { method: 'DELETE' });
            await handleApiResponse(res);
            setHistorySessions(prev => prev.filter(s => s.id !== id));
            refreshData();
        } catch (err) {
            console.error("Error deleting session:", err);
            alert("Failed to delete session");
        }
    };

    const handleViewHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/api/sessions?limit=-1`);
            const data = await handleApiResponse<Session[]>(res);
            setHistorySessions(data);
            setShowHistory(true);
        } catch (err) {
            console.error("Error fetching history:", err);
            const message = err instanceof ApiError ? err.message : 'Failed to fetch history';
            setError(message);
        }
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
                    <button onClick={handleExport} className="btn-primary text-sm py-2 flex items-center shadow-primary/20">
                        <ArrowUpRight size={16} className="mr-2" />
                        Export Data
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto hover:bg-white/10 p-1 rounded-lg">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Bento Grid Layout - 12 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24">
                
                {/* === LEFT COLUMN (MAIN STATS & CHARTS) === */}
                <div ref={leftColRef} className="md:col-span-8 flex flex-col gap-6 h-full">
                    
                    {/* Top Stats Row */}
                    {/* Top Stats Row */}
                    <StatsCards stats={stats} />

                    {/* Chart Section */}
                    {/* Chart Section */}
                    <ActivityChart data={chartData} />

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
                sessions={historySessions} 
                onDeleteSession={handleDeleteHistorySession} 
                onClearHistory={handleClearHistory} 
            />
        </div>
    );
};

export default Dashboard;
