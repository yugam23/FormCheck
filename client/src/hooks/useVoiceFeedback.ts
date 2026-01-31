
import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for voice feedback synthesis with throttling.
 *
 * Prevents duplicate messages from being spoken repeatedly within
 * a 3-second window to avoid audio spam during workouts.
 *
 * @returns Voice feedback controls
 * - `speak`: Function to synthesize text to speech
 * - `enabled`: Current voice state
 * - `setEnabled`: Toggle voice feedback
 *
 * @example
 * ```tsx
 * const { speak, enabled, setEnabled } = useVoiceFeedback();
 *
 * // Speak with throttling
 * speak("Lower your back");
 *
 * // Force immediate speech (bypasses throttle)
 * speak("10 reps!", true);
 * ```
 */
export const useVoiceFeedback = () => {
    const [enabled, setEnabled] = useState(true);
    const lastSpokenRef = useRef<string | null>(null);
    const lastTimeRef = useRef<number>(0);
    
    // Throttle duplicate messages (e.g. don't say "Lower" 10 times a second)
    const speak = useCallback((text: string, force: boolean = false) => {
        if (!enabled || !window.speechSynthesis) return;
        
        const now = Date.now();
        const isRepeat = lastSpokenRef.current === text;
        const timeSinceLast = now - lastTimeRef.current;
        
        // If it's a new message, say it immediately
        // If it's a repeat, wait at least 3 seconds
        if (!isRepeat || timeSinceLast > 3000 || force) {
            window.speechSynthesis.cancel(); // Prioritize new message
            
            const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
            utterance.rate = 1.1; // Slightly faster
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            window.speechSynthesis.speak(utterance);
            
            lastSpokenRef.current = text;
            lastTimeRef.current = now;
        }
    }, [enabled]);

    return { speak, setEnabled, enabled };
};
