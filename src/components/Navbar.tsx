import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  BookOpen,
  Menu,
  X,
  User,
  ChevronDown,
  Scissors,
  Minimize2,
  Lock,
  RotateCw,
  FileSpreadsheet,
  Image,
  ScanText,
  Stamp,
  Activity,
  LogOut,
  Sliders,
  CheckCircle2,
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

interface QuickToolItem {
  id: ToolId;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  isAi?: boolean;
}

const QUICK_TOOLS: QuickToolItem[] = [
  { id: 'ai-chat', name: 'Chat with PDF', category: 'AI', icon: Sparkles, isAi: true },
  { id: 'ai-analyzer', name: 'Risk Analyzer', category: 'AI', icon: ShieldCheck, isAi: true },
  { id: 'merge', name: 'Merge PDF', category: 'Organize', icon: FileText },
  { id: 'split', name: 'Split PDF', category: 'Organize', icon: Scissors },
  { id: 'compress', name: 'Compress PDF', category: 'Convert', icon: Minimize2 },
  { id: 'pdf-to-word', name: 'PDF to Word', category: 'Convert', icon: FileSpreadsheet },
  { id: 'images-to-pdf', name: 'Images to PDF', category: 'Convert', icon: Image },
  { id: 'ocr', name: 'OCR Extract', category: 'Convert', icon: ScanText },
  { id: 'watermark', name: 'Watermark', category: 'Security', icon: Stamp },
  { id: 'protect', name: 'Protect PDF', category: 'Security', icon: Lock },
  { id: 'rotate', name: 'Rotate Pages', category: 'Organize', icon: RotateCw },
];

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
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const { user, openAuthModal, upgradePlan, logout } = useAuth();
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

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsToolsDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsDropdownRef.current &&
        !toolsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsToolsDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    if (onSelectTool) {
      onSelectTool(null);
    }
    navigate('/');
  };

  const handleToolSelect = (id: ToolId | null) => {
    setIsToolsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (onSelectTool) {
      onSelectTool(id);
    }
    if (id === null) {
      navigate('/');
    } else if (id === 'ai-chat') {
      navigate('/ai-chat');
    } else if (id === 'ai-analyzer') {
      navigate('/document-analyzer');
    } else if (id === 'telemetry') {
      navigate('/team');
    } else if (id === 'admin-seo') {
      navigate('/admin/content-generator');
    } else {
      navigate('/');
    }
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
      setIsProfileDropdownOpen((prev) => !prev);
    } else {
      openAuthModal('login');
    }
  };

  const handleSignOut = async () => {
    setIsProfileDropdownOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isAllToolsActive =
    activeTool === null &&
    (location.pathname === '/' ||
      location.pathname.startsWith('/merge') ||
      location.pathname.startsWith('/split') ||
      location.pathname.startsWith('/compress'));

  const isAiChatActive =
    activeTool === 'ai-chat' ||
    location.pathname === '/ai-chat' ||
    location.pathname === '/chat-pdf';

  const isAiAnalyzerActive =
    activeTool === 'ai-analyzer' ||
    location.pathname === '/document-analyzer';

  const isTelemetryActive =
    activeTool === 'telemetry' ||
    location.pathname === '/team' ||
    location.pathname === '/team-workspace' ||
    location.pathname === '/dashboard';

  const isSeoActive =
    activeTool === 'admin-seo' ||
    location.pathname.startsWith('/admin');

  const isBlogActive =
    location.pathname === '/blog' ||
    location.pathname.startsWith('/blog/');

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-800/90 text-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] transition-all">
        {/* Subtle glowing top accent stripe */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo & Interactive Home Trigger */}
          <div
            id="brand-logo"
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group select-none py-1"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-rose-500 to-amber-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-white">
                  <FileText className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors duration-200" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-indigo-200 transition-colors">
                  SmartPDF
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-rose-500/20 text-indigo-300 border border-indigo-500/30">
                  AI v2.4
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal hidden sm:block tracking-normal">
                Zero-Upload WASM & Gemini Intelligence
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-medium shadow-inner">
            {/* Tools Dropdown Trigger */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                id="nav-tools-dropdown-toggle"
                onClick={() => setIsToolsDropdownOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isToolsDropdownOpen || isAllToolsActive
                    ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>All PDF Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isToolsDropdownOpen ? 'rotate-180 text-indigo-400' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Tools Dropdown Panel */}
              {isToolsDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                    <span>POPULAR UTILITIES</span>
                    <button
                      onClick={() => handleToolSelect(null)}
                      className="text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                    >
                      View All (11)
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto pr-1">
                    {QUICK_TOOLS.map((tool) => {
                      const IconComp = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => handleToolSelect(tool.id)}
                          className="flex items-center gap-2 p-2 rounded-xl text-left hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition group cursor-pointer"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                              tool.isAi
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400 group-hover:text-white'
                            }`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate font-medium">{tool.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* AI Document Chat */}
            <Link
              to="/ai-chat"
              id="nav-ai-chat"
              onClick={() => onSelectTool && onSelectTool('ai-chat')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isAiChatActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Chat</span>
            </Link>

            {/* Enterprise Risk Analyzer */}
            <Link
              to="/document-analyzer"
              id="nav-ai-analyzer"
              onClick={() => onSelectTool && onSelectTool('ai-analyzer')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isAiAnalyzerActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Doc Analyzer</span>
            </Link>

            {/* Pricing */}
            <button
              id="nav-pricing"
              onClick={handleOpenPricing}
              className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Pricing</span>
            </button>

            {/* Blog & Guides */}
            <Link
              to="/blog"
              id="nav-blog"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isBlogActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Blog</span>
            </Link>
          </nav>

          {/* Right Actions (Health, Upgrade, Profile, Mobile Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live System Health Badge */}
            <div
              id="system-health-pill"
              title={`System: ${health?.status || 'Operational'} | WASM Engine: Ready | Gemini AI: Active`}
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-medium text-slate-300 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>WASM & Gemini Active</span>
            </div>

            {/* Upgrade / Pro Plan CTA */}
            <button
              id="pricing-button"
              onClick={handleOpenPricing}
              className="relative inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all duration-200 cursor-pointer overflow-hidden group"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-white group-hover:rotate-12 transition-transform" />
              <span className="capitalize">
                {userSession.plan === 'free' ? 'Upgrade to Pro' : `${userSession.plan} Tier`}
              </span>
            </button>

            {/* User Profile & Account Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                id="auth-profile-button"
                onClick={handleOpenAuth}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm"
              >
                {userSession.email ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-rose-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                      {userSession.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[90px] sm:max-w-[110px] truncate hidden sm:inline">
                      {userSession.email.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Sign In</span>
                  </>
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {user && isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user.name || 'SmartPDF Member'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 capitalize">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{user.plan} Member</span>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>User Dashboard</span>
                  </Link>

                  <Link
                    to="/team"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span>Team & Telemetry</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition mt-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Navigation Drawer Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/90 bg-[#0B0F19]/95 backdrop-blur-xl px-4 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Quick Mobile Tools Link */}
            <button
              onClick={() => handleToolSelect(null)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isAllToolsActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>All PDF Tools</span>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">11 tools</span>
            </button>

            {/* AI Document Chat */}
            <Link
              to="/ai-chat"
              onClick={() => {
                if (onSelectTool) onSelectTool('ai-chat');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isAiChatActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Document Chat</span>
            </Link>

            {/* Enterprise Analyzer */}
            <Link
              to="/document-analyzer"
              onClick={() => {
                if (onSelectTool) onSelectTool('ai-analyzer');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isAiAnalyzerActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Enterprise Risk Analyzer</span>
            </Link>

            {/* Pricing */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleOpenPricing();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800/60 transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Pricing Plans</span>
              </div>
              <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                Pro
              </span>
            </button>

            {/* Blog */}
            <Link
              to="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isBlogActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Guides & Blog</span>
            </Link>

            {/* Mobile Footer Status & CTA */}
            <div className="pt-4 mt-3 border-t border-slate-800 space-y-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenPricing();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Upgrade to Pro Plan</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  WASM & Gemini Active
                </span>
                <span className="text-[11px] text-slate-500 font-mono">v2.4.0</span>
              </div>
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

