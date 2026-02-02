// useVoiceFeedback.ts
//
// Web Speech API wrapper for real-time workout audio cues.
//
// Problem Solved:
//   During exercise, the backend sends feedback every frame (~15 FPS).
//   Without throttling, this would result in overlapping, unintelligible speech.
//   This hook deduplicates messages and enforces a minimum interval (VOICE_THROTTLE_MS).
//
// Throttling Strategy:
//   - New messages: Speak immediately (after canceling any in-progress speech)
//   - Repeated messages: Only speak if VOICE_THROTTLE_MS has elapsed
//   - Force flag: Bypass throttling for important events like rep completion
//
// Browser Support:
//   Falls back gracefully if window.speechSynthesis is unavailable.
//   Most modern browsers support it; check caniuse.com for specifics.

import { useState, useCallback, useRef } from 'react';
import { VOICE_THROTTLE_MS, VOICE_RATE, VOICE_PITCH, VOICE_VOLUME } from '../lib/constants';

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
        // If it's a repeat, wait at least VOICE_THROTTLE_MS
        if (!isRepeat || timeSinceLast > VOICE_THROTTLE_MS || force) {
            window.speechSynthesis.cancel(); // Prioritize new message
            
            const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
            utterance.rate = VOICE_RATE; // Slightly faster
            utterance.pitch = VOICE_PITCH;
            utterance.volume = VOICE_VOLUME;
            
            window.speechSynthesis.speak(utterance);
            
            lastSpokenRef.current = text;
            lastTimeRef.current = now;
        }
    }, [enabled]);

    return { speak, setEnabled, enabled };
};
