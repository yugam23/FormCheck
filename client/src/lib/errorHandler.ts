
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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
