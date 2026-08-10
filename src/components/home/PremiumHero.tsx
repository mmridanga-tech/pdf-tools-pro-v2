import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, X, ArrowRight, Sparkles, Shield, Zap, Cpu } from 'lucide-react';

interface PremiumHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const PremiumHero: React.FC<PremiumHeroProps> = React.memo(({ searchQuery, onSearchChange }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        !(document.activeElement instanceof HTMLInputElement) &&
        !(document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartExploring = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-12 pb-12 sm:pt-16 sm:pb-16 bg-[#08090D] overflow-hidden border-b border-white/[0.06]">
      {/* Background Soft Ambient Gradient & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.8) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Soft, restrained warm rose/red ambient backlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-red-500/10 via-rose-500/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-2xl mx-auto">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-medium text-slate-300 mb-5 tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            <span>WebAssembly • Gemini AI • 100% Private</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-4"
          >
            Your Documents.{' '}
            <span className="bg-gradient-to-r from-white via-slate-200 to-red-400 bg-clip-text text-transparent">
              Smarter. Simpler.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal mb-7 max-w-lg mx-auto"
          >
            Powerful PDF tools and AI document workflows, right in your browser.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
          >
            <button
              onClick={handleStartExploring}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all duration-150 cursor-pointer group active:scale-[0.98]"
            >
              <span>Explore Tools</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <Link
              to="/ai-chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-semibold text-xs sm:text-sm border border-white/[0.08] hover:border-white/20 transition-all duration-150 cursor-pointer group active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Chat with PDF</span>
            </Link>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="max-w-md mx-auto mb-7"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search PDF tools..."
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-[#0e0f15] border border-white/[0.08] shadow-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all text-xs sm:text-sm"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="absolute inset-y-0 right-0 pr-3 hidden sm:flex items-center pointer-events-none">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white/[0.03] rounded border border-white/[0.08]">
                    ⌘K
                  </kbd>
                </div>
              )}
            </div>
          </motion.div>

          {/* Compact Inline Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.22 }}
            className="inline-flex items-center justify-center gap-4 text-xs font-medium text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Private</span>
            </div>
            <span className="text-white/10">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              <span>Fast</span>
            </div>
            <span className="text-white/10">•</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>AI Powered</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

