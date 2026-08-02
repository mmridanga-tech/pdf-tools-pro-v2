import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, openAuthModal, googleLogin } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await googleLogin();
    } catch {
      // Error is handled in AuthContext/toast
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-[#0A0A0B]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-[#121215] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Authentication Required</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Please sign in with Google to access your account workspace, saved document history, AI summaries, and team settings.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#18181d] hover:bg-[#22222b] text-white border border-slate-700/80 rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              {loading ? 'Connecting Google...' : 'Sign In with Google'}
            </button>

            <button
              onClick={() => openAuthModal('login')}
              className="w-full py-3 px-4 bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Other Sign In Options</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-[#0A0A0B]">
        <div className="max-w-md w-full bg-[#121215] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Access Restricted</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Administrator permissions are required to view the System Command Center & Admin Panel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
