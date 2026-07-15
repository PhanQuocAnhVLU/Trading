import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes/router';
import ErrorBoundary from './app/ErrorBoundary';
import { useAuthStore } from './features/auth/store/authStore';
import './styles/globals.css';

// Restore/track the real Firebase session once at startup.
useAuthStore.getState().init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
);
