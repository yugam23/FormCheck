export interface Session {
    id: number;
    exercise: string;
    reps: number;
    duration: number;
    timestamp: number;
}

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
