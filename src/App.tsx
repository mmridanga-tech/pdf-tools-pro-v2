import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AppRoutes } from './routes/AppRoutes';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { CookieConsent } from './components/CookieConsent';
import { analytics } from './services/analytics';
import { clarity } from './services/clarity';
import { errorReporter } from './services/errorReporter';
import { monitoring } from './services/monitoring';

export default function App() {
  useEffect(() => {
    // Initialize production monitoring & telemetry services
    analytics.init();
    clarity.init();
    errorReporter.init();
    monitoring.init();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <FeatureFlagProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-slate-200 font-sans antialiased selection:bg-red-500 selection:text-white">
                <Navbar />
                <main className="flex-grow" id="main-content">
                  <AppRoutes />
                </main>
                <Footer />
                <ToastContainer />
                <AuthModal />
                <CookieConsent />
              </div>
            </BrowserRouter>
          </FeatureFlagProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
