// LoadingFallback.tsx
//
// Full-screen loading indicator for lazy-loaded route transitions.
//
// Used as the Suspense fallback in App.tsx when lazily-loaded pages
// (HomeView, WorkoutView, Dashboard) are still being fetched.
//
// Visual Design:
//   - Centered pulsing icon with glow effect
//   - Matches app's glassmorphism aesthetic
//   - Provides visual continuity during navigation

import { Activity } from 'lucide-react';

/**
 * Full-screen loading indicator with animated pulsing effect.
 * Used during route transitions (Suspense fallback) or initial app load.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<LoadingFallback />}>
 *   <Component />
 * </Suspense>
 * ```
 */
const LoadingFallback = () => {
    return (
        <div className="flex items-center justify-center min-h-[50vh] w-full">
            <div className="relative flex flex-col items-center gap-4">
                {/* Glowing Background */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse-slow"></div>
                
                {/* Icon with Ring */}
                <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
                    <Activity className="w-10 h-10 text-primary animate-pulse" />
                </div>
                
                {/* Loading Text */}
                <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase animate-pulse">
                    Loading...
                </span>
            </div>
        </div>
    );
};

export default LoadingFallback;
