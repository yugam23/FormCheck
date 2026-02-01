import { ArrowUpRight, AlertCircle, X, Loader2 } from 'lucide-react';
import { useToast } from './ui/Toast';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import type { Session } from '../types';
import { handleApiResponse } from '../lib/errorHandler';
import { StatsCards } from './dashboard/StatsCards';
import { ActivityChart } from './dashboard/ActivityChart';
import { DistributionChart } from './dashboard/DistributionChart';
import { PersonalRecords } from './dashboard/PersonalRecords';
import { WeeklyGoal } from './dashboard/WeeklyGoal';
import { RecentActivity } from './dashboard/RecentActivity';
import { HistoryModal } from './dashboard/HistoryModal';
import { StatsSkeleton, ChartSkeleton } from './ui/Skeleton';
import { ChartErrorBoundary } from './ui/ChartErrorBoundary';
import { useFetch } from '../hooks/useFetch';

import { API_URL } from '../lib/constants';

// Hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useExport } from '../hooks/useExport';

/**
 * Dashboard main view displaying workout analytics and statistics.
 * Refactored to use custom hooks for data fetching and logic.
 */
export const Dashboard: React.FC = () => {
    const toast = useToast();
    
    // Custom Hooks
    const { 
        sessions, 
        stats, 
        analytics, 
        goal, 
        setGoal, 
        isLoading: isLoadingData, 
        error: dataError, 
        chartData, 
        refreshData 
    } = useDashboardData();

    const { isExporting, exportToCSV } = useExport();

    // History Logic (Lazy Load)
    const [showHistory, setShowHistory] = useState(false);
    const {
         data: historySessionsData,
         refetch: fetchHistory
    } = useFetch<Session[]>(`${API_URL}/api/sessions?limit=-1`, { immediate: false });
    
    // Error Handling
    const [manualError, setManualError] = useState<string | null>(null);
    const error = manualError || dataError;

    // Layout & UI State
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];
    const leftColRef = useRef<HTMLDivElement>(null);
    const [rightColHeight, setRightColHeight] = useState<number | undefined>(undefined);

    // Initial Data Load
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Sync heights (Layout Effect with Error Boundary)
    useLayoutEffect(() => {
        try {
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
        } catch (e) {
            console.error("Layout effect error:", e);
        }
    }, [stats, chartData, analytics]); 

    // Actions
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
            fetchHistory(); // Refetch history if open
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

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-display font-bold text-white mb-2">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back, Athlete. Here is your performance overview.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleViewHistory} className="btn-secondary text-sm py-2">History</button>
                    <button 
                        onClick={exportToCSV} 
                        disabled={isExporting || isLoadingData} 
                        className="btn-primary text-sm py-2 flex items-center shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <ArrowUpRight size={16} className="mr-2" />}
                        {isExporting ? 'Exporting...' : 'Export Data'}
                    </button>
                </div>
            </header>

            {error && (
                <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                    <AlertCircle size={20} aria-hidden="true" />
                    <p>{error}</p>
                    <button onClick={() => setManualError(null)} className="ml-auto hover:bg-white/10 p-1 rounded-lg" aria-label="Dismiss error">
                        <X size={16} aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Bento Grid Layout - 12 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24">
                
                {/* === LEFT COLUMN (MAIN STATS & CHARTS) === */}
                <div ref={leftColRef} className="md:col-span-8 flex flex-col gap-6 h-full">
                    
                    {/* Top Stats Row */}
                    {isLoadingData ? <StatsSkeleton /> : <StatsCards stats={stats} />}

                    {/* Chart Section */}
                    {isLoadingData ? <ChartSkeleton /> : (
                        <ChartErrorBoundary>
                            <ActivityChart data={chartData} />
                        </ChartErrorBoundary>
                    )}

                    {/* Analytics Row (Pie & PRs) */}
                    {isLoadingData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="glass-panel p-6 rounded-2xl animate-pulse h-64"></div>
                             <div className="glass-panel p-6 rounded-2xl animate-pulse h-64"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Distribution */}
                            <ChartErrorBoundary>
                                <DistributionChart data={analytics.distribution} colors={COLORS} />
                            </ChartErrorBoundary>

                            {/* PRs */}
                            <ChartErrorBoundary>
                                <PersonalRecords prs={analytics.prs} />
                            </ChartErrorBoundary>
                        </div>
                    )}

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
