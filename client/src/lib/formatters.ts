/**
 * Formats seconds into MM:SS string.
 *
 * @param seconds - Number of seconds
 * @returns Formatted time string (e.g., "01:30")
 */
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Formats exercise metrics based on exercise type.
 *
 * @param exercise - Name of the exercise (e.g., "Plank")
 * @param value - Raw metric value (reps or seconds)
 * @returns Object containing formatted value and unit label
 *
 * @example
 * ```ts
 * formatMetric('Plank', 65) // { value: "01:05", unit: "Time" }
 * formatMetric('Pushups', 20) // { value: "20", unit: "Reps" }
 * ```
 */
export const formatMetric = (exercise: string, value: number) => {
    if (exercise === 'Plank') {
        return { value: formatTime(value), unit: 'Time' };
    }
    return { value: value.toString(), unit: 'Reps' };
};
