import { describe, it, expect } from 'vitest';
import { handleApiResponse, ApiError } from './errorHandler';

describe('ApiError', () => {
    it('constructs correctly', () => {
        const error = new ApiError(404, 'Not Found', 'Resource not found');
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
        expect(error.message).toBe('Resource not found');
        expect(error.name).toBe('ApiError');
    });
});

describe('handleApiResponse', () => {
    it('parses JSON on success', async () => {
        const mockResponse = new Response(JSON.stringify({ id: 1 }), {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await handleApiResponse<{ id: number }>(mockResponse);
        expect(data).toEqual({ id: 1 });
    });

    it('returns empty object for empty body on success', async () => {
        const mockResponse = new Response(null, {
            status: 204,
            statusText: 'No Content',
        });

        const data = await handleApiResponse(mockResponse);
        expect(data).toEqual({});
    });

    it('throws ApiError on failure', async () => {
        const mockResponse = new Response(null, {
            status: 404,
            statusText: 'Not Found',
        });

        await expect(handleApiResponse(mockResponse)).rejects.toThrow(ApiError);
        await expect(handleApiResponse(mockResponse)).rejects.toThrow('HTTP 404: Not Found');
    });

    it('throws ApiError with correct properties', async () => {
        const mockResponse = new Response(null, {
            status: 500,
            statusText: 'Server Error',
        });

        try {
            await handleApiResponse(mockResponse);
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(500);
                expect(error.statusText).toBe('Server Error');
            }
        }
    });
});
