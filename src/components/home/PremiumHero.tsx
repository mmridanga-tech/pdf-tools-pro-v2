import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  ShieldCheck,
  Sparkles,
  X,
  ArrowRight,
  BookOpen,
  Zap,
  EyeOff,
  Cpu,
  Layers,
  FileText,
  Lock,
  CheckCircle2,
} from 'lucide-react';

interface PremiumHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const PremiumHero: React.FC<PremiumHeroProps> = React.memo(({ searchQuery, onSearchChange }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleStartExploring = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-12 pb-14 md:pt-16 md:pb-20 bg-[#08090E] overflow-hidden border-b border-white/[0.08]">
      {/* Background Lighting and Ambient FX */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Modern Dot Matrix Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, rgba(255, 255, 255, 0.9) 1px, transparent 0)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Central Core Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-red-600/20 via-rose-600/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

        {/* Floating Ambient Lights */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-[15%] w-96 h-96 bg-red-600/15 rounded-full blur-[120px] opacity-70"
        />
        <motion.div
          animate={{
            x: [0, -35, 25, 0],
            y: [0, 25, -25, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 right-[15%] w-[420px] h-[420px] bg-rose-500/10 rounded-full blur-[140px] opacity-60"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Innovation Pill */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-3 px-4.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs sm:text-sm font-semibold text-red-400 mb-5 shadow-2xl backdrop-blur-xl hover:border-red-500/40 transition-colors"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-slate-200">Powered by WebAssembly & Gemini AI</span>
            <span className="h-3 w-[1px] bg-white/20 mx-0.5" />
            <span className="text-red-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 100% Private
            </span>
          </motion.div>

          {/* Luxury Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-4"
          >
            The Next-Generation <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">
              Smart PDF AI Suite
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-slate-300/90 leading-relaxed font-normal mb-6"
          >
            Merge, split, compress, convert, OCR, and converse with documents directly in browser memory. High-performance, zero file uploads, and enterprise privacy guaranteed.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-7"
          >
            <button
              onClick={handleStartExploring}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-[0_10px_30px_rgba(239,68,68,0.35)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.5)] border border-red-400/40 transition-all duration-300 cursor-pointer group active:scale-[0.98]"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              to="/ai-chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold text-base border border-white/10 hover:border-white/20 shadow-lg backdrop-blur-md transition-all duration-300 group active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span>Chat with PDF (AI)</span>
            </Link>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-red-400 transition-colors" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search PDF tools (e.g., merge, compress, pdf to word, ocr)..."
                className="w-full pl-13 pr-14 py-4.5 rounded-2xl bg-[#12131A]/90 border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)] text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500/70 transition-all text-sm sm:text-base backdrop-blur-xl"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute inset-y-0 right-0 pr-4.5 hidden sm:flex items-center pointer-events-none">
                  <kbd className="px-2 py-1 text-[11px] font-mono text-slate-400 bg-white/5 rounded border border-white/10">
                    ⌘K
                  </kbd>
                </div>
              )}
            </div>
          </motion.div>

          {/* Trust Highlights Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-3.5 p-4 rounded-[18px] bg-[#11121A]/70 border border-white/10 shadow-lg backdrop-blur-md hover:border-amber-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-bold text-white">100% Free</span>
                <span className="block text-[11px] text-slate-400">No Ads, No Limits</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-[18px] bg-[#11121A]/70 border border-white/10 shadow-lg backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-bold text-white">Client-Side Memory</span>
                <span className="block text-[11px] text-slate-400">Zero File Uploads</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-[18px] bg-[#11121A]/70 border border-white/10 shadow-lg backdrop-blur-md hover:border-purple-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-bold text-white">WebAssembly Engine</span>
                <span className="block text-[11px] text-slate-400">Sub-Second Processing</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-[18px] bg-[#11121A]/70 border border-white/10 shadow-lg backdrop-blur-md hover:border-rose-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                <EyeOff className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-bold text-white">Private & Secure</span>
                <span className="block text-[11px] text-slate-400">100% Data Confidentiality</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});
