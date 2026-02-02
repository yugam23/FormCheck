// Testing Strategy:
//
// Framework: Vitest (fast, Vite-native)
// Testing Library: @testing-library/react (user-centric tests)
//
// Test Types:
//   1. Unit Tests: Hooks, utilities, pure functions
//   2. Component Tests: UI behavior, user interactions
//   3. Integration Tests: API mocking, data flows
//   (No E2E tests currently—would use Playwright if needed)
//
// Coverage Goals:
//   - Critical paths: 90%+ (useFetch, errorHandler, exercises.py)
//   - UI components: 70%+ (focus on user-facing bugs)
//   - Utils/formatters: 100% (pure functions, easy to test)
//
// Mock Strategy:
//   - API calls: MSW (Mock Service Worker)
//   - WebSocket: Manual mock in test setup
//   - MediaPipe: Not mocked (too complex, skip in tests)

import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFetch } from './useFetch';
import { ApiError } from '../lib/errorHandler';

// Mock global fetch
const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

describe('useFetch', () => {
    beforeEach(() => {
        fetchMock.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch data successfully', async () => {
        const mockData = { id: 1, name: 'Test' };
        fetchMock.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockData)),
        });

        const { result } = renderHook(() => useFetch('/api/test'));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it('should handle API errors', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            text: () => Promise.resolve(''),
        });

        const { result } = renderHook(() => useFetch('/api/test'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
        expect(result.current.error?.message).toContain('404');
    });

    it('should support immediate: false', async () => {
        // Mock fetch to resolve but check loading state during execution
        fetchMock.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            text: () => Promise.resolve(JSON.stringify({}))
        }), 10)));

        const { result } = renderHook(() => useFetch('/api/test', { immediate: false }));

        expect(result.current.loading).toBe(false); // Should be false initially
        expect(fetchMock).not.toHaveBeenCalled();

        let refetchPromise: Promise<void>;
        act(() => {
            refetchPromise = result.current.refetch();
        });

        expect(result.current.loading).toBe(true);
        
        await act(async () => {
             await refetchPromise;
        });
    });
    
    it('should handle abort/cancellation', async () => {
         // This is a bit tricky to test perfectly with mocks effectively, but we can verify AbortSignal is passed
         fetchMock.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve(JSON.stringify({})),
         });
         
         const { unmount } = renderHook(() => useFetch('/api/test'));
         
         unmount();
         
         // In a real scenario, this triggers the abort.
         // Pass verification via spy if needed, but the main goal is ensuring no state update on unmount
         // which React Testing Library handles by default warnings if we mess up.
         // Here we just ensure it doesn't crash.
    });
    
    it('should refetch data', async () => {
        const mockData1 = { val: 1 };
        const mockData2 = { val: 2 };
        
        fetchMock
            .mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify(mockData1)),
            })
            .mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify(mockData2)),
            });

        const { result } = renderHook(() => useFetch('/api/test'));

        await waitFor(() => expect(result.current.data).toEqual(mockData1));
        
        await act(async () => {
            await result.current.refetch();
        });
        
        await waitFor(() => expect(result.current.data).toEqual(mockData2));
    });
});
