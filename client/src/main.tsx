// main.tsx
//
// React application entry point with Sentry error monitoring integration.
//
// Initializes error tracking before rendering to catch any startup failures.
// Sentry captures both errors (100% sample) and session replays (10% normal,
// 100% on error) to help debug issues in production.
//
// StrictMode is enabled to surface potential problems during development
// (double-renders, deprecated API usage, etc).

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
