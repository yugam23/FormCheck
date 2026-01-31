
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
