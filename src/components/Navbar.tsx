import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight, Search, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDF_TOOLS } from '../utils/toolsData';
import { CommandPaletteModal } from './CommandPaletteModal';

const NAV_LINKS = [
  { path: '/', label: 'All Tools' },
  { path: '/merge', label: 'Merge' },
  { path: '/split', label: 'Split' },
  { path: '/compress', label: 'Compress' },
  { path: '/protect-pdf', label: 'Protect' },
  { path: '/unlock-pdf', label: 'Unlock' },
  { path: '/pdf-to-word', label: 'PDF to Word' },
  { path: '/ocr-pdf', label: 'OCR PDF' },
];

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
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
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-red-600/30"
              >
                P
              </motion.div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  PDF Tools <span className="text-red-500">Pro</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                  100% Free
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activePath === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                      isActive ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 bg-red-500/10 border border-red-500/20 rounded-xl"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Command Palette Trigger & Security Badge */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl border border-slate-800 transition-colors shadow-sm cursor-pointer"
                aria-label="Search tools with keyboard shortcut"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search Tools</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-950 rounded border border-slate-800">
                  ⌘K
                </kbd>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium px-3.5 py-1.5 bg-slate-900/80 rounded-full border border-slate-800 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Client Security</span>
              </div>
            </div>

            {/* Mobile Actions (Search + Hamburger) */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                aria-label="Search tools"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
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
              className="md:hidden border-b border-slate-800 bg-[#0C0C0E] px-4 pt-2 pb-6 space-y-2 shadow-2xl overflow-hidden"
            >
              <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                PDF Tools Suite
              </p>
              {PDF_TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-red-400 font-semibold text-sm transition-colors"
                >
                  <span>{tool.name}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 p-3 text-xs text-slate-400 font-medium bg-slate-900/60 rounded-xl border border-slate-800/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No server uploads. Files stay safely in browser.</span>
                </div>
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


