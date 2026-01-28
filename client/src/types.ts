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
