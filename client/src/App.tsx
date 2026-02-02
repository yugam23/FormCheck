// App.tsx
//
// Root application shell with routing and global providers.
//
// Structure:
//   ErrorBoundary -> ToastProvider -> BrowserRouter -> Routes
//
// Lazy Loading Strategy:
//   All page components (HomeView, WorkoutView, Dashboard) are lazy-loaded
//   to reduce initial bundle size. Users see LoadingFallback during chunk
//   fetch. This improves Time-to-Interactive for first-time visitors.
//
// Route Layout:
//   All routes share MainLayout which provides the sidebar navigation.
//   - /          : Exercise selection (HomeView)
//   - /workout   : Active workout with webcam (WorkoutView)
//   - /dashboard : Stats, history, and analytics (Dashboard)

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import LoadingFallback from '@/components/LoadingFallback';

// Lazy load pages for better initial bundle size
const HomeView = lazy(() => import('@/components/HomeView'));
const WorkoutView = lazy(() => import('@/components/WorkoutView'));
const Dashboard = lazy(() => import('@/components/Dashboard'));

import { ToastProvider } from '@/components/ui/Toast';

import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Suspense fallback={<LoadingFallback />}><HomeView /></Suspense>} />
              <Route path="/workout" element={<Suspense fallback={<LoadingFallback />}><WorkoutView /></Suspense>} />
              <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
