export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatMetric = (exercise: string, value: number) => {
    if (exercise === 'Plank') {
        return { value: formatTime(value), unit: 'Time' };
    }
    return { value: value.toString(), unit: 'Reps' };
};
