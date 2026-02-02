// types.ts
//
// Shared TypeScript type definitions for FormCheck client.
//
// These types define the data contracts between:
// - Frontend components (consuming data)
// - WebSocket messages (real-time pose data)
// - REST API responses (session history, stats, analytics)
//
// Sync with Backend:
//   The backend (Python/Pydantic) defines equivalent schemas in app/schemas.py.
//   Changes to data shape should be synchronized between both files.
//
// Landmark Convention:
//   Follows MediaPipe's 33-point pose model. Coordinates are normalized
//   (0.0-1.0) relative to video dimensions. Visibility indicates detection
//   confidence—low visibility landmarks should be handled gracefully.

/** Single body landmark from MediaPipe pose detection */
export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility: number;
}

/** Real-time form feedback from exercise strategy */
export interface FeedbackData {
    color: 'red' | 'green' | 'blue' | 'yellow';
    message: string;
    angle?: number;
}

/** WebSocket RESULT message payload */
export interface PoseData {
    type?: string;
    landmarks?: Landmark[];
    feedback?: FeedbackData;
    reps?: number;
}

/** Request body for POST /api/save-session */
export interface SessionCreate {
    exercise: string;
    reps: number;
    duration: number;
}

/** Full session record including server-generated fields */
export interface Session extends SessionCreate {
    id: number;
    /** Unix timestamp (seconds) of session completion */
    timestamp: number;
}

/**
 * Legacy rep data structure.
 * @deprecated Use PoseData instead for real-time updates
 */
export interface RepData {
    rep_count: number;
    form_quality_score: number;
}

/**
 * Generic API response wrapper.
 * 
 * Note: Current backend returns arrays directly for list endpoints.
 * This wrapper is defined for future standardization but may not
 * match all existing endpoints. Check endpoint-specific docs.
 */
export interface ApiResponse<T> {
    success?: boolean;
    data?: T;
    error?: string;
}
