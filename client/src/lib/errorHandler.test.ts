import { describe, it, expect } from 'vitest';
import { ApiError, handleApiResponse } from './errorHandler';

describe('ApiError', () => {
  it('should construct correctly', () => {
    const error = new ApiError(404, 'Not Found', 'Resource missing');
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(404);
    expect(error.statusText).toBe('Not Found');
    expect(error.message).toBe('Resource missing');
    expect(error.name).toBe('ApiError');
  });
});

describe('handleApiResponse', () => {
  it('should return parsed JSON for successful response', async () => {
    const mockData = { success: true };
    const response = {
      ok: true,
      text: () => Promise.resolve(JSON.stringify(mockData)),
    } as Response;

    const result = await handleApiResponse(response);
    expect(result).toEqual(mockData);
  });

  it('should return empty object for empty body', async () => {
    const response = {
      ok: true,
      text: () => Promise.resolve(''),
    } as Response;

    const result = await handleApiResponse(response);
    expect(result).toEqual({});
  });

  it('should throw ApiError for non-ok response', async () => {
    const response = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response;

    await expect(handleApiResponse(response)).rejects.toThrow(ApiError);
    
    try {
      await handleApiResponse(response);
    } catch (error) {
       expect(error).toBeInstanceOf(ApiError);
       if (error instanceof ApiError) {
         expect(error.status).toBe(500);
         expect(error.message).toContain('HTTP 500');
       }
    }
  });
});
