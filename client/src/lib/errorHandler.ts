// errorHandler.ts
//
// API response handling and custom error types.
//
// Provides a consistent pattern for handling fetch responses:
// - Non-2xx responses throw ApiError with status details
// - Empty responses (204 No Content) return empty object
// - Successful responses are parsed as JSON
//
// Design Decision:
//   Using a custom ApiError class instead of generic Error allows
//   callers to access HTTP status codes for specific error handling
//   (e.g., 401 -> redirect to login, 404 -> show "not found" UI).

// Error Hierarchy:
//   ApiError (custom class)
//     ├─ NetworkError (fetch failed, no response)
//     ├─ ValidationError (400 Bad Request)
//     ├─ AuthError (401/403)
//     └─ ServerError (500+)
//
// Usage Pattern:
//   try {
//     const data = await handleApiResponse(response);
//   } catch (err) {
//     if (err instanceof ApiError) {
//       toast.error(err.message);  // User-friendly message
//       console.error(err.details); // Technical details for debugging
//     }
//   }
//
// Integration:
//   - Used by useFetch hook for GET requests
//   - Used directly in WorkoutView for POST /api/save-session
//   - Error messages shown via Toast component (UI layer)

/**
 * Custom error class for API response errors.
 */
export class ApiError extends Error {
  public status: number;
  public statusText: string;

  /**
    * @param status - HTTP status code
    * @param statusText - HTTP status text
    * @param message - Error message
    */
  constructor(
    status: number,
    statusText: string,
    message: string
  ) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.name = 'ApiError';
  }
}

/**
 * Handles API responses by checking method status and parsing JSON.
 * Throws ApiError on non-2xx status codes.
 *
 * @template T - Expected response data type
 * @param response - The Fetch API Response object
 * @returns Promise resolving to the parsed JSON data or empty object
 * @throws {ApiError} If response.ok is false
 *
 * @example
 * ```ts
 * const data = await handleApiResponse<User>(response);
 * ```
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      `HTTP ${response.status}: ${response.statusText}`
    );
  }
  // Check if response has content before parsing JSON
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}
