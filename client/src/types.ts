
export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility: number;
}

export interface FeedbackData {
    color: 'red' | 'green';
    message: string;
    angle?: number;
}

export interface PoseData {
    type?: string;
    landmarks?: Landmark[];
    feedback?: FeedbackData;
    reps?: number;
}

export interface SessionCreate {
    exercise: string;
    reps: number;
    duration: number;
}

export interface Session extends SessionCreate {
    id: number;
    timestamp: number;
}

export interface RepData {
    rep_count: number;
    form_quality_score: number;
}

export interface ApiResponse<T> {
    success?: boolean; // Optional because legacy endpoints might not return it yet
    data?: T;
    error?: string;
    // For direct list returns or other shapes, we might need flexibility or enforce a wrapper on backend
}

// Backend actually returns arrays directly for sessions, so we need to be careful with ApiResponse wrapper assumption.
// The current backend (Python) returns JSON directly. 
// Example: `return sessions` (List[Session])
// So ApiResponse wrapper might not match reality unless we change backend.
// For now, let's keep ApiResponse as a utility type for *future* standardization or where applicable.

