import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDF_TOOLS } from '../utils/toolsData';
import { CommandPaletteModal } from './CommandPaletteModal';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, openAuthModal, logout } = useAuth();
  const location = useLocation();
  const activePath = location.pathname;

  // Global Keyboard Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-xl focus:shadow-2xl text-xs font-bold"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-[#0C0C0E]/90 backdrop-blur-md border-b border-slate-800/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-red-600/30"
              >
                S
              </motion.div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  SmartPDF <span className="text-red-500">AI</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activePath === '/' ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tools Suite
              </Link>

              <Link
                to="/ai-chat"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activePath === '/ai-chat'
                    ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Chat
              </Link>

              <Link
                to="/ai-assistant"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activePath === '/ai-assistant'
                    ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                    : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> AI Tools
              </Link>

              <Link
                to="/document-analyzer"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activePath === '/document-analyzer'
                    ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Doc Analyzer
              </Link>

              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activePath === '/dashboard' ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/team"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activePath === '/team' ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Team
              </Link>

              <Link
                to="/cloud-storage"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activePath === '/cloud-storage' ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cloud Sync
              </Link>

              <Link
                to="/pricing"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activePath === '/pricing' ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pricing
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors text-red-500 hover:text-red-400 ${
                    activePath === '/admin' ? 'bg-red-500/10 border border-red-500/20' : ''
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              {/* Command Palette Button */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl border border-slate-800 transition-colors shadow-sm cursor-pointer"
                aria-label="Search tools with keyboard shortcut"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-950 rounded border border-slate-800">
                  ⌘K
                </kbd>
              </button>

              {/* User Account / Auth Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 bg-[#18181d] hover:bg-[#202028] border border-slate-800 rounded-2xl transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-red-500/40"
                    />
                    <span className="text-xs font-bold text-white hidden sm:inline-block">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute right-0 mt-2 w-56 bg-[#121215] border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 space-y-1"
                      >
                        <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                          <p className="text-xs font-bold text-white">{user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          <span className="mt-1.5 inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white">
                            {user.plan} Plan
                          </span>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard & History
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" /> Settings
                        </Link>

                        <Link
                          to="/help"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                        >
                          <HelpCircle className="w-4 h-4 text-slate-400" /> Help & Support
                        </Link>

                        <Link
                          to="/team"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                        >
                          <Users className="w-4 h-4 text-slate-400" /> Team Workspace
                        </Link>

                        <Link
                          to="/pricing"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 rounded-xl transition-colors"
                        >
                          <Zap className="w-4 h-4" /> Upgrade Plan
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-slate-800/60 rounded-xl transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" /> Admin Console
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer mt-1 border-t border-slate-800/60"
                        >
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="xl:hidden border-b border-slate-800 bg-[#0C0C0E] px-4 pt-2 pb-6 space-y-2 shadow-2xl overflow-hidden"
            >
              <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Main Pages
              </p>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-300 font-bold text-sm"
              >
                <span>Dashboard & History</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                to="/ai-chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-amber-400 font-bold text-sm"
              >
                <span>AI PDF Chat</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </Link>
              <Link
                to="/ai-assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-purple-400 font-bold text-sm"
              >
                <span>AI Assistant Suite</span>
                <Zap className="w-4 h-4 text-purple-400" />
              </Link>
              <Link
                to="/document-analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-emerald-400 font-bold text-sm"
              >
                <span>Doc Analyzer v1.2</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </Link>
              <Link
                to="/team"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-300 font-bold text-sm"
              >
                <span>Team Workspaces</span>
                <Users className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-300 font-bold text-sm"
              >
                <span>Pricing Plans</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>

              <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-2 mb-1">
                Company & Legal
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-slate-900/60 rounded-xl hover:bg-slate-800"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-slate-900/60 rounded-xl hover:bg-slate-800"
                >
                  Contact Us
                </Link>
                <Link
                  to="/privacy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-slate-900/60 rounded-xl hover:bg-slate-800"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-slate-900/60 rounded-xl hover:bg-slate-800"
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
