import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    googleLogin,
    logout,
    sendPasswordReset,
    sendEmailVerification,
  } = useAuth();

  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
    setName('');
    closeAuthModal();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await googleLogin();
      toast.success('Successfully signed in with Google!');
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
        toast.success('Welcome back!');
        handleClose();
      } else if (authModalMode === 'register') {
        await register(name, email, password);
        toast.success('Account created successfully!');
        handleClose();
      } else if (authModalMode === 'forgot') {
        await sendPasswordReset(email);
        setSuccessMessage('Password reset link sent to your email. Please check your inbox.');
        toast.success('Password reset email sent!');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast.info('Signed out of account');
      handleClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign out.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification();
      toast.success('Verification email sent to ' + user?.email);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification email.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121215] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-800 text-white relative">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isAuthenticated && user ? (
          // Signed-In Profile View
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 object-cover"
              />
              <div className="overflow-hidden">
                <h3 className="font-bold text-white text-base truncate">{user.name}</h3>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Plan:</span>
                <span className="font-bold uppercase text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 text-[10px]">
                  {user.plan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="font-bold uppercase text-slate-300 text-[10px]">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email Status:</span>
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  {user.emailVerified ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={handleSendVerification}
                      className="text-amber-400 hover:underline text-[11px]"
                    >
                      Unverified (Click to verify)
                    </button>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Member Since:</span>
                <span className="text-slate-300 font-mono text-[11px]">{user.createdAt}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Auth Forms: Sign In / Sign Up / Forgot Password
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center font-bold mx-auto mb-3">
                {authModalMode === 'forgot' ? (
                  <KeyRound className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <h3 className="font-extrabold text-white text-xl tracking-tight">
                {authModalMode === 'login' && 'Sign In to SmartPDF'}
                {authModalMode === 'register' && 'Create Your Account'}
                {authModalMode === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {authModalMode === 'login' && 'Access cloud storage, AI credits & team workspaces'}
                {authModalMode === 'register' && 'Get free AI credits and secure document history'}
                {authModalMode === 'forgot' && 'Enter your email to receive recovery instructions'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {authModalMode !== 'forgot' && (
              <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    openAuthModal('login');
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authModalMode === 'login'
                      ? 'bg-red-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    openAuthModal('register');
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authModalMode === 'register'
                      ? 'bg-red-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            {authModalMode !== 'forgot' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#18181d] hover:bg-[#22222b] text-white border border-slate-700/80 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 my-4 text-xs text-slate-500">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span>or with email</span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>
              </>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {authModalMode === 'register' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Full Name:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Email Address:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {authModalMode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-semibold text-slate-300">Password:</label>
                    {authModalMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setSuccessMessage(null);
                          openAuthModal('forgot');
                        }}
                        className="text-[11px] text-red-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>
                      {authModalMode === 'login' && 'Sign In'}
                      {authModalMode === 'register' && 'Create Free Account'}
                      {authModalMode === 'forgot' && 'Send Reset Email'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {authModalMode === 'forgot' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      openAuthModal('login');
                    }}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
