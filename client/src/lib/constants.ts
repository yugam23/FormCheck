// constants.ts
//
// Centralized configuration values for the FormCheck client.
//
// Environment Variables:
//   VITE_API_URL: Backend REST API base URL (default: http://localhost:8000)
//   VITE_WS_URL: WebSocket endpoint URL (default: ws://localhost:8000/ws)
//
// Tuning Notes:
//   - VIDEO_WIDTH/HEIGHT: 640x480 balances quality vs. bandwidth
//   - FRAME_RATE: 15 FPS is sufficient for pose detection accuracy
//   - VOICE_THROTTLE_MS: 3s prevents audio spam during exercise
//   - JPEG_QUALITY: 0.6 reduces WebSocket payload by ~60% vs. PNG

// API Configuration
export const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";
export const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

// Video Configuration
export const VIDEO_WIDTH = 640; // Balances quality vs bandwidth (640x480 = ~300KB/frame at JPEG 0.6)
export const VIDEO_HEIGHT = 480; // Standard VGA resolution, widely supported
export const FRAME_RATE = 15; // FPS - sufficient for pose detection, reduces CPU/network load
export const JPEG_QUALITY = 0.6; // 0.0-1.0 range, 0.6 reduces payload by ~60% with minimal quality loss

// WebSocket Configuration
export const MAX_RECONNECT_ATTEMPTS = 10; // Hard limit to prevent infinite reconnection loops
export const BASE_RECONNECT_DELAY_MS = 1000; // Initial delay (1s), increases exponentially
export const MAX_RECONNECT_DELAY_MS = 10000; // Cap at 10s to avoid excessive wait times

// Dashboard Configuration
export const CHART_DAYS = 7; // Number of days shown in activity chart
export const DEFAULT_WEEKLY_GOAL = 500; // Default rep target (adjustable in UI)
export const DAYS_PER_LEVEL = 7; // Streak levels: 1-6 days, 7-13 days, etc.
export const MIN_LEVEL = 1; // Minimum user level (displayed in UI)

// Voice Feedback
export const VOICE_THROTTLE_MS = 3000; // Min interval between repeated messages (prevents audio spam)
export const VOICE_RATE = 1.1; // Speech rate multiplier (1.0 = normal, 0.1-2.0 valid range)
export const VOICE_PITCH = 1.0; // Pitch multiplier (1.0 = normal, 0.1-2.0 valid range)
export const VOICE_VOLUME = 0.8; // Volume level (0.0-1.0), slightly reduced to avoid overpowering

// Time Constants
export const MILLISECONDS_PER_SECOND = 1000; // Used for timer calculations
export const SECONDS_PER_MINUTE = 60; // Used for MM:SS time formatting
