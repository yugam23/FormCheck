import { useState, useEffect, useCallback, useRef } from 'react';
import { handleApiResponse } from '../lib/errorHandler';

interface UseFetchOptions extends RequestInit {
    immediate?: boolean;
}

interface UseFetchState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Custom hook for fetching data with built-in:
 * - Loading state
 * - Error handling
 * - Request cancellation (AbortController)
 * - Refetch capability
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Object containing data, loading, error, and refetch function
 */
export function useFetch<T>(url: string, options: UseFetchOptions = {}) {
    // Default immediate to true unless specified
    const { immediate = true, ...fetchOptions } = options;

    // Use refs to hold latest options/immediate values to avoid dependency cycles
    const optionsRef = useRef(fetchOptions);
    useEffect(() => {
        optionsRef.current = fetchOptions;
    }); // Update on every render

    const [state, setState] = useState<UseFetchState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await fetch(url, {
                ...optionsRef.current,
                signal: controller.signal,
            });
            const result = await handleApiResponse<T>(response);
            
            // Only update state if not aborted (though catch block handles AbortError usually)
            if (!controller.signal.aborted) {
                setState({ data: result, loading: false, error: null });
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                // Request was aborted, do nothing
                return;
            }
            setState({ data: null, loading: false, error: err as Error });
        }
    }, [url]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [immediate, fetchData]);

    return { ...state, refetch: fetchData };
}
