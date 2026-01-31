
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import LoadingFallback from '@/components/LoadingFallback';

// Lazy load pages for better initial bundle size
const HomeView = lazy(() => import('@/components/HomeView'));
const WorkoutView = lazy(() => import('@/components/WorkoutView'));
const Dashboard = lazy(() => import('@/components/Dashboard'));

import { ToastProvider } from '@/components/ui/Toast';

function App() {
  return (
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
  );
}

export default App;
