import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  Menu,
  X,
  User,
  ExternalLink,
} from 'lucide-react';
import { ToolId, UserSession, SystemHealthData } from '../types';
import { api } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { PricingModal } from './PricingModal';

interface NavbarProps {
  activeTool?: ToolId | null;
  onSelectTool?: (id: ToolId | null) => void;
  userSession?: UserSession;
  onOpenPricing?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTool,
  onSelectTool,
  userSession: propUserSession,
  onOpenPricing: propOnOpenPricing,
  onOpenAuth: propOnOpenAuth,
}) => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const { user, openAuthModal, upgradePlan } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userSession: UserSession = propUserSession || {
    uid: user?.id || 'guest_user',
    email: user?.email || '',
    role: user?.role || 'user',
    plan: user?.plan || 'free',
    token: '',
    dailyAiLimit: user?.plan === 'pro' ? 200 : user?.plan === 'enterprise' ? 10000 : 25,
    dailyAiUsed: 0,
  };

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch((err) => console.warn('Health check warning:', err));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogoClick = () => {
    if (onSelectTool) {
      onSelectTool(null);
    }
    navigate('/');
  };

  const handleOpenPricing = () => {
    if (propOnOpenPricing) {
      propOnOpenPricing();
    } else {
      setIsPricingModalOpen(true);
    }
  };

  const handleOpenAuth = () => {
    if (propOnOpenAuth) {
      propOnOpenAuth();
    } else if (user) {
      navigate('/dashboard');
    } else {
      openAuthModal('login');
    }
  };

  const isAllToolsActive =
    activeTool === null &&
    (location.pathname === '/' || location.pathname.startsWith('/merge') || location.pathname.startsWith('/split') || location.pathname.startsWith('/compress'));

  const isAiChatActive =
    activeTool === 'ai-chat' || location.pathname === '/ai-chat' || location.pathname === '/chat-pdf';

  const isAiAnalyzerActive =
    activeTool === 'ai-analyzer' || location.pathname === '/document-analyzer';

  const isTelemetryActive =
    activeTool === 'telemetry' || location.pathname === '/team' || location.pathname === '/team-workspace' || location.pathname === '/dashboard';

  const isSeoActive =
    activeTool === 'admin-seo' || location.pathname.startsWith('/admin');

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#08090D]/90 backdrop-blur-md border-b border-white/[0.08] text-slate-100 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div
            id="brand-logo"
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg tracking-tight">SmartPDF</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                  AI Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Privacy-First Browser WASM Engine
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.08] text-xs font-medium">
            <Link
              to="/"
              id="nav-all-tools"
              onClick={() => onSelectTool && onSelectTool(null)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isAllToolsActive
                  ? 'bg-white/[0.1] text-white shadow-sm font-semibold border border-white/[0.12]'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              All PDF Tools
            </Link>

            <Link
              to="/ai-chat"
              id="nav-ai-chat"
              onClick={() => onSelectTool && onSelectTool('ai-chat')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isAiChatActive
                  ? 'bg-red-600 text-white shadow-sm font-semibold shadow-red-600/30'
                  : 'text-slate-300 hover:text-red-400 hover:bg-white/[0.05]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>AI Document Chat</span>
            </Link>

            <Link
              to="/document-analyzer"
              id="nav-ai-analyzer"
              onClick={() => onSelectTool && onSelectTool('ai-analyzer')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isAiAnalyzerActive
                  ? 'bg-red-600 text-white shadow-sm font-semibold shadow-red-600/30'
                  : 'text-slate-300 hover:text-red-400 hover:bg-white/[0.05]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Enterprise Analyzer</span>
            </Link>

            <Link
              to="/team"
              id="nav-telemetry"
              onClick={() => onSelectTool && onSelectTool('telemetry')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isTelemetryActive
                  ? 'bg-red-600 text-white shadow-sm font-semibold shadow-red-600/30'
                  : 'text-slate-300 hover:text-red-400 hover:bg-white/[0.05]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Telemetry</span>
            </Link>

            <Link
              to="/admin/content-generator"
              id="nav-admin-seo"
              onClick={() => onSelectTool && onSelectTool('admin-seo')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isSeoActive
                  ? 'bg-red-600 text-white shadow-sm font-semibold shadow-red-600/30'
                  : 'text-slate-300 hover:text-red-400 hover:bg-white/[0.05]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>SEO Studio</span>
            </Link>
          </nav>

          {/* Right Actions (Status, Pricing, Profile, Mobile Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WASM / Gemini Active Status Indicator */}
            <div
              id="system-health-pill"
              title={`System: ${health?.status || 'Operational'} | Gemini: ${health?.services.gemini.status || 'Active'}`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WASM / Gemini Active</span>
            </div>

            {/* Pro Plan / Pricing Button */}
            <button
              id="pricing-button"
              onClick={handleOpenPricing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="capitalize">{userSession.plan === 'free' ? 'Pro Plan' : `${userSession.plan} Plan`}</span>
            </button>

            {/* Admin / Profile Account Button */}
            <button
              id="auth-profile-button"
              onClick={handleOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              {userSession.email ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-[10px]">
                    {userSession.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {userSession.email.split('@')[0]}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Sign In</span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-[#08090D] px-4 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => {
                if (onSelectTool) onSelectTool(null);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                isAllToolsActive
                  ? 'bg-white/[0.1] text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>All PDF Tools</span>
            </Link>

            <Link
              to="/ai-chat"
              onClick={() => {
                if (onSelectTool) onSelectTool('ai-chat');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                isAiChatActive
                  ? 'bg-red-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>AI Document Chat</span>
            </Link>

            <Link
              to="/document-analyzer"
              onClick={() => {
                if (onSelectTool) onSelectTool('ai-analyzer');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                isAiAnalyzerActive
                  ? 'bg-red-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Enterprise Analyzer</span>
            </Link>

            <Link
              to="/team"
              onClick={() => {
                if (onSelectTool) onSelectTool('telemetry');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                isTelemetryActive
                  ? 'bg-red-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>Telemetry</span>
            </Link>

            <Link
              to="/admin/content-generator"
              onClick={() => {
                if (onSelectTool) onSelectTool('admin-seo');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                isSeoActive
                  ? 'bg-red-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              <Globe className="w-4 h-4 text-slate-400" />
              <span>SEO Studio</span>
            </Link>

            {/* Mobile Status Indicator */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 px-3 py-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                WASM / Gemini Active
              </span>
              <span className="text-[11px] text-slate-500 font-mono">v2.4.0</span>
            </div>
          </div>
        )}
      </header>

      {/* Internal Pricing Modal Trigger */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        userSession={userSession}
        onPlanUpdated={(newPlan) => {
          if (newPlan === 'pro' || newPlan === 'enterprise') {
            upgradePlan(newPlan);
          }
          setIsPricingModalOpen(false);
        }}
      />
    </>
  );
};
