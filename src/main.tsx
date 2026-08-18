import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { AppRoutes } from './routes/AppRoutes';
import { ToastContainer } from './components/ToastContainer';
import { CookieConsent } from './components/CookieConsent';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// PWA Service Worker Registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => {
        console.warn('PWA service worker registration notice:', err);
      });
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <FeatureFlagProvider>
              <BrowserRouter>
                <AppRoutes />
                <ToastContainer />
                <CookieConsent />
              </BrowserRouter>
            </FeatureFlagProvider>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

