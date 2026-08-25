import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  Menu,
  X,
  User,
  ChevronDown,
  ChevronRight,
  Scissors,
  Minimize2,
  Lock,
  Unlock,
  RotateCw,
  FileSpreadsheet,
  Image,
  ScanText,
  Stamp,
  Activity,
  LogOut,
  Sliders,
  Trash2,
  FileOutput,
  ArrowUpDown,
  FileCheck,
  Headphones,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { ToolId, UserSession, SystemHealthData } from '../types';
import { api } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PricingModal } from './PricingModal';

interface NavbarProps {
  activeTool?: ToolId | null;
  onSelectTool?: (id: ToolId | null) => void;
  userSession?: UserSession;
  onOpenPricing?: () => void;
  onOpenAuth?: () => void;
}

interface DropdownTool {
  name: string;
  path: string;
  toolId?: ToolId;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  isAi?: boolean;
}

interface ToolCategoryGroup {
  title: string;
  color: string;
  items: DropdownTool[];
}

const TOOL_CATEGORIES: ToolCategoryGroup[] = [
  {
    title: 'Organize & Edit',
    color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
    items: [
      { name: 'Merge PDF', path: '/merge', toolId: 'merge', icon: FileText, description: 'Combine multiple PDFs in custom order', badge: 'Popular' },
      { name: 'Split PDF', path: '/split', toolId: 'split', icon: Scissors, description: 'Separate pages or extract ranges' },
      { name: 'Rotate PDF', path: '/rotate', toolId: 'rotate', icon: RotateCw, description: 'Rotate 90°, 180° or 270°' },
      { name: 'Delete Pages', path: '/delete-pages', icon: Trash2, description: 'Remove unwanted pages cleanly' },
      { name: 'Extract Pages', path: '/extract-pages', icon: FileOutput, description: 'Export chosen pages to new PDF' },
      { name: 'Page Numbers', path: '/page-numbers', icon: Sliders, description: 'Add header & footer pagination' },
    ],
  },
  {
    title: 'Convert & Optimize',
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    items: [
      { name: 'Compress PDF', path: '/compress', toolId: 'compress', icon: Minimize2, description: 'Reduce size while preserving quality', badge: 'Popular' },
      { name: 'PDF to Word', path: '/pdf-to-word', toolId: 'pdf-to-word', icon: FileSpreadsheet, description: 'Convert PDF to editable DOCX', badge: 'Fast' },
      { name: 'Word to PDF', path: '/word-to-pdf', icon: FileText, description: 'Convert DOC & DOCX to PDF' },
      { name: 'Images to PDF', path: '/image-to-pdf', toolId: 'images-to-pdf', icon: Image, description: 'Convert JPG, PNG, WebP to PDF' },
      { name: 'PDF to Images', path: '/pdf-to-image', icon: Image, description: 'Extract pages to high-res JPG/PNG' },
      { name: 'OCR Text Extract', path: '/ocr-pdf', toolId: 'ocr', icon: ScanText, description: 'Extract selectable text from scan', badge: 'AI' },
    ],
  },
  {
    title: 'Security & Privacy',
    color: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
    items: [
      { name: 'Protect PDF', path: '/protect-pdf', toolId: 'protect', icon: Lock, description: 'Lock with AES-256 password', badge: 'AES-256' },
      { name: 'Unlock PDF', path: '/unlock-pdf', icon: Unlock, description: 'Remove forgotten permission locks' },
      { name: 'Watermark PDF', path: '/watermark', toolId: 'watermark', icon: Stamp, description: 'Add custom security stamp' },
    ],
  },
  {
    title: 'AI Intelligence',
    color: 'text-rose-400 border-rose-500/20 bg-rose-500/10',
    items: [
      { name: 'Chat with PDF', path: '/ai-chat', toolId: 'ai-chat', icon: Sparkles, description: 'Interactive Q&A with page citations', badge: 'Gemini', isAi: true },
      { name: 'Doc Analyzer', path: '/document-analyzer', toolId: 'ai-analyzer', icon: ShieldCheck, description: 'Legal, risk & compliance audit', badge: 'Audit', isAi: true },
      { name: 'PDF Diff Compare', path: '/diff-compare', icon: ArrowUpDown, description: 'Compare revisions side-by-side', isAi: true },
      { name: 'Resume ATS Review', path: '/resume-reviewer', icon: FileCheck, description: 'ATS score, format & keyword check', isAi: true },
      { name: 'Smart PII Redact', path: '/pii-redaction', icon: ShieldCheck, description: 'Auto-redact sensitive personal info', isAi: true },
      { name: 'Audio Podcast', path: '/audio-podcast', icon: Headphones, description: 'Convert document into audio recap', isAi: true },
    ],
  },
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
  const { theme, isDark, toggleTheme } = useTheme();
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

  const handleToolNavigate = (path: string, toolId?: ToolId | null) => {
    setIsToolsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (onSelectTool && toolId !== undefined) {
      onSelectTool(toolId);
    }
    navigate(path);
  };

  const [mobileToolsExpanded, setMobileToolsExpanded] = useState(false);

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

              {/* Tools Mega Dropdown Panel */}
              {isToolsDropdownOpen && (
                <div className="absolute -left-12 top-full mt-2 w-[720px] bg-[#0F172A]/95 backdrop-blur-2xl border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        All PDF Utilities & AI Tools
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        100% In-Browser WASM
                      </span>
                    </div>
                    <button
                      onClick={() => handleToolNavigate('/')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-semibold flex items-center gap-1"
                    >
                      <span>Explore Home Grid</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {TOOL_CATEGORIES.map((cat, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="px-2 py-1 flex items-center gap-1.5">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${cat.color}`}>
                            {cat.title}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {cat.items.map((tool, tIdx) => {
                            const IconComp = tool.icon;
                            return (
                              <Link
                                key={tIdx}
                                to={tool.path}
                                onClick={() => handleToolNavigate(tool.path, tool.toolId)}
                                className="w-full flex flex-col p-2 rounded-xl text-left hover:bg-slate-800/80 transition-all group border border-transparent hover:border-slate-700/60 cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                                      tool.isAi
                                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                                    }`}
                                  >
                                    <IconComp className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="truncate font-semibold text-xs text-slate-300 group-hover:text-white">
                                    {tool.name}
                                  </span>
                                  {tool.badge && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 ml-auto shrink-0">
                                      {tool.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 group-hover:text-slate-400 line-clamp-1 mt-0.5 pl-7">
                                  {tool.description}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Client-side WASM engine — Zero server file uploads
                    </span>
                    <span className="text-slate-500 font-mono">21+ Tools Available</span>
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

            {/* Dark / Light Mode Toggle Button */}
            <button
              id="theme-toggle-button"
              onClick={toggleTheme}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 animate-in spin-in-90 duration-300" />
              )}
              <span className="text-xs font-semibold hidden md:inline">
                {isDark ? 'Light' : 'Dark'}
              </span>
            </button>

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
            {/* Quick Mobile Tools Link & Accordion */}
            <div className="rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800/80">
              <button
                onClick={() => setMobileToolsExpanded((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold transition text-left cursor-pointer ${
                  isAllToolsActive || mobileToolsExpanded ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>All PDF Tools & Utilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">21 tools</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileToolsExpanded ? 'rotate-180 text-indigo-400' : ''}`} />
                </div>
              </button>

              {mobileToolsExpanded && (
                <div className="p-3 space-y-3 bg-slate-950/60 border-t border-slate-800/60 max-h-80 overflow-y-auto">
                  {TOOL_CATEGORIES.map((cat, cIdx) => (
                    <div key={cIdx} className="space-y-1">
                      <p className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block border ${cat.color}`}>
                        {cat.title}
                      </p>
                      <div className="grid grid-cols-2 gap-1 pt-1">
                        {cat.items.map((tool, tIdx) => {
                          const IconComp = tool.icon;
                          return (
                            <Link
                              key={tIdx}
                              to={tool.path}
                              onClick={() => {
                                handleToolNavigate(tool.path, tool.toolId);
                                setIsMobileMenuOpen(false);
                              }}
                              className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white"
                            >
                              <IconComp className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate font-medium">{tool.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <button
                      onClick={() => handleToolNavigate('/')}
                      className="w-full py-2 text-center text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg"
                    >
                      View Home Tool Grid
                    </button>
                  </div>
                </div>
              )}
            </div>

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

            {/* Mobile Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800/60 transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span>Theme Mode</span>
              </div>
              <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                {isDark ? 'Dark (Switch to Light)' : 'Light (Switch to Dark)'}
              </span>
            </button>

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

