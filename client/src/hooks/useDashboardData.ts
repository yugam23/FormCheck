// useDashboardData.ts
//
// Aggregates and transforms data from multiple API endpoints for the dashboard.
//
// Fetches from:
//   - /api/sessions: Recent workout sessions
//   - /api/stats: Summary statistics (total reps, streak, etc.)
//   - /api/analytics: Personal records and exercise distribution
//   - /api/settings/goal: User's weekly goal setting
//
// Why a dedicated hook:
//   The dashboard needs data from 4 endpoints. This hook consolidates them
//   into a single loading state, combined error message, and provides derived
//   data (chartData) ready for visualization components.
//
// Chart Data:
//   Computes daily rep counts for the last 7 days for the activity chart.
//   Uses session timestamps to bucket reps by day.

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useFetch } from './useFetch';
import { API_URL, DEFAULT_WEEKLY_GOAL } from '../lib/constants';
import type { Session } from '../types';

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

export function useDashboardData() {
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
    
    // Local goal state for updates (optimistic UI)
    const [goal, setGoal] = useState(DEFAULT_WEEKLY_GOAL);
    
    // Sync goal from server
    useEffect(() => {
        if (goalData) setGoal(goalData.goal);
    }, [goalData]);

    const isLoading = loadingSessions || loadingStats || loadingAnalytics || loadingGoal;
    
    const error = 
        (errorSessions?.message ? `Sessions: ${errorSessions.message}` : null) ||
        (errorStats?.message ? `Stats: ${errorStats.message}` : null) ||
        (errorAnalytics?.message ? `Analytics: ${errorAnalytics.message}` : null) ||
        (errorGoal?.message ? `Goal: ${errorGoal.message}` : null);

    const chartData = useMemo(() => {
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
        refetchSessions();
        refetchStats();
        refetchAnalytics();
        refetchGoal();
    }, [refetchSessions, refetchStats, refetchAnalytics, refetchGoal]);

    return {
        sessions,
        stats,
        analytics,
        goal,
        setGoal,
        isLoading,
        error,
        chartData,
        refreshData
    };
}
