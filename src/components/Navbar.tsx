import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Search,
  Sparkles,
  Users,
  Cloud,
  LayoutDashboard,
  Zap,
  User,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Settings,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDF_TOOLS } from '../utils/toolsData';
import { CommandPaletteModal } from './CommandPaletteModal';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const { user, openAuthModal, logout } = useAuth();
  const location = useLocation();
  const activePath = location.pathname;

  // Global Keyboard Listener & Click Outside Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setMoreDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setMoreDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isMoreActive = [
    '/dashboard',
    '/team',
    '/cloud-storage',
    '/pricing',
    '/blog',
    '/admin',
  ].some((path) =>
    path === '/blog' ? activePath.startsWith('/blog') : activePath === path
  );

  return (
    <>
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-xl focus:shadow-2xl text-xs font-bold"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-[#08090d]/85 backdrop-blur-md border-b border-white/[0.06] transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm"
              >
                S
              </motion.div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                  SmartPDF <span className="text-red-500">AI</span>
                </span>
              </div>
            </Link>

            {/* Desktop Primary Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activePath === '/'
                    ? 'text-white font-semibold bg-white/[0.06]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                Tools Suite
              </Link>

              <Link
                to="/ai-chat"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activePath === '/ai-chat'
                    ? 'text-red-400 font-semibold bg-white/[0.06]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-red-400" /> AI Chat
              </Link>

              <Link
                to="/ai-assistant"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activePath === '/ai-assistant'
                    ? 'text-red-400 font-semibold bg-white/[0.06]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-slate-400" /> AI Tools
              </Link>

              <Link
                to="/document-analyzer"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activePath === '/document-analyzer'
                    ? 'text-red-400 font-semibold bg-white/[0.06]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Doc Analyzer
              </Link>

              {/* More Dropdown */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMoreDropdownOpen((prev) => !prev);
                    setUserDropdownOpen(false);
                  }}
                  aria-expanded={moreDropdownOpen}
                  aria-haspopup="true"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    isMoreActive || moreDropdownOpen
                      ? 'text-white bg-white/[0.06] font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      moreDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {moreDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 mt-2 w-48 bg-[#0e0f15] border border-white/[0.08] rounded-xl p-1 shadow-2xl z-50 space-y-0.5"
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activePath === '/dashboard'
                            ? 'text-white bg-white/[0.08] font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/team"
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activePath === '/team'
                            ? 'text-white bg-white/[0.08] font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Team</span>
                      </Link>

                      <Link
                        to="/cloud-storage"
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activePath === '/cloud-storage'
                            ? 'text-white bg-white/[0.08] font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Cloud className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cloud Sync</span>
                      </Link>

                      <Link
                        to="/pricing"
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activePath === '/pricing'
                            ? 'text-white bg-white/[0.08] font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pricing</span>
                      </Link>

                      <Link
                        to="/blog"
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activePath.startsWith('/blog')
                            ? 'text-white bg-white/[0.08] font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Blog</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setMoreDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-white/[0.04] transition-colors ${
                            activePath === '/admin' ? 'bg-white/[0.08]' : ''
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Admin</span>
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2">
              {/* Command Palette Button */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 text-xs font-medium rounded-lg border border-white/[0.08] transition-colors cursor-pointer"
                aria-label="Search tools"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold text-slate-500 bg-white/[0.04] rounded border border-white/[0.08]">
                  ⌘K
                </kbd>
              </button>

              {/* User Account / Auth Dropdown */}
              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setMoreDropdownOpen(false);
                    }}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 p-1 pl-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-red-500/40"
                    />
                    <span className="text-xs font-medium text-slate-200 hidden sm:inline-block">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 5 }}
                        className="absolute right-0 mt-2 w-56 bg-[#0e0f15] border border-white/[0.08] rounded-xl p-1.5 shadow-2xl z-50 space-y-1"
                      >
                        <div className="px-2.5 py-1.5 border-b border-white/[0.06] mb-1">
                          <p className="text-xs font-semibold text-white">{user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          <span className="mt-1 inline-block px-2 py-0.5 text-[9px] font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30">
                            {user.plan} Plan
                          </span>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" /> Dashboard & History
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
                        </Link>

                        <Link
                          to="/help"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Help & Support
                        </Link>

                        <Link
                          to="/team"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-400" /> Team Workspace
                        </Link>

                        <Link
                          to="/pricing"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-white/[0.04] rounded-lg transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" /> Upgrade Plan
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-white/[0.04] rounded-lg transition-colors"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" /> Admin Console
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left cursor-pointer mt-1 border-t border-white/[0.06]"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="lg:hidden border-b border-white/[0.08] bg-[#08090d] px-4 pt-3 pb-6 space-y-2 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Main Navigation
              </p>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-slate-200 font-medium text-sm min-h-[44px]"
              >
                <span>Tools Suite</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-slate-300 font-medium text-sm min-h-[44px]"
              >
                <span>Dashboard & History</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                to="/ai-chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 font-medium text-sm border border-white/[0.08] min-h-[44px]"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-400" /> AI PDF Chat
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/ai-assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 font-medium text-sm border border-white/[0.08] min-h-[44px]"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-slate-400" /> AI Assistant Suite
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/document-analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 font-medium text-sm border border-white/[0.08] min-h-[44px]"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" /> Doc Analyzer
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/team"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-slate-300 font-medium text-sm min-h-[44px]"
              >
                <span>Team Workspaces</span>
                <Users className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-slate-300 font-medium text-sm min-h-[44px]"
              >
                <span>Pricing Plans</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-slate-300 font-medium text-sm min-h-[44px]"
              >
                <span>Knowledge Hub & Articles</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>

              <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-3 mb-1">
                Company & Legal
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-300">
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] flex items-center min-h-[44px]"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] flex items-center min-h-[44px]"
                >
                  Contact Us
                </Link>
                <Link
                  to="/privacy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] flex items-center min-h-[44px]"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] flex items-center min-h-[44px]"
                >
                  Terms & Conditions
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Command Palette Modal */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
};
