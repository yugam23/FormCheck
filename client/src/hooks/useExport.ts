// useExport.ts
//
// CSV export functionality for workout session history.
//
// Fetches all sessions (limit=-1) from the API and generates a downloadable
// CSV file with date, time, exercise type, reps, and duration.
//
// CSV Format:
//   Date,Time,Exercise,Reps,Duration(s)
//   1/15/2024,10:30:00 AM,Pushups,25,120
//
// File Naming:
//   formcheck_export_YYYY-MM-DD.csv (using current date)

import { useState } from 'react';
import { API_URL } from '../lib/constants';
import { handleApiResponse, ApiError } from '../lib/errorHandler';
import { useToast } from '../components/ui/Toast';
import type { Session } from '../types';

/**
 * Hook for exporting workout history to CSV.
 *
 * @returns
 * - isExporting: Loading state during export
 * - exportToCSV: Trigger function that fetches all sessions and downloads CSV
 */
export function useExport() {
    const [isExporting, setIsExporting] = useState(false);
    const toast = useToast();

    const exportToCSV = async () => {
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

    return { isExporting, exportToCSV };
}
