import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  Sparkles,
  X,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HardDriveDownload,
  EyeOff,
  Zap,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = React.memo(({ searchQuery, onSearchChange }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleStartUsingTools = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-16 pb-20 md:pt-28 md:pb-28 bg-[#090A0F] overflow-hidden border-b border-slate-800/80">
      {/* Lightweight Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Ambient Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.8) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Top Radial Light Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-gradient-to-b from-red-600/15 via-rose-600/5 to-transparent blur-3xl rounded-full" />

        {/* Ambient Light Orb 1 (Desktop only to minimize main-thread work) */}
        <div className="hidden sm:block">
          <motion.div
            animate={{
              x: [0, 20, -20, 0],
              y: [0, -25, 15, 0],
              scale: [1, 1.08, 0.95, 1],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -top-16 left-1/4 w-80 h-80 bg-red-600/15 rounded-full blur-[100px] opacity-60 pointer-events-none"
          />
        </div>

        {/* Ambient Light Orb 2 (Desktop only to minimize main-thread work) */}
        <div className="hidden sm:block">
          <motion.div
            animate={{
              x: [0, -25, 20, 0],
              y: [0, 20, -20, 0],
              scale: [1, 0.92, 1.08, 1],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute top-12 right-1/4 w-96 h-96 bg-rose-700/10 rounded-full blur-[110px] opacity-50 pointer-events-none"
          />
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Premium Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-red-500/30 text-xs sm:text-sm font-semibold text-red-400 mb-8 shadow-xl shadow-red-950/30 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="tracking-wide">Next-Gen Client-Side & AI PDF Platform</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6"
        >
          The Smarter, Faster Way to <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
            Edit, Convert & Analyze
          </span> PDFs
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-slate-300/90 mb-10 leading-relaxed font-normal"
        >
          Complete suite of high-performance PDF tools running 100% locally in your browser. Merge, split, compress, convert, and extract data with zero file uploads and complete privacy.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartUsingTools}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-xl shadow-red-600/25 border border-red-400/30 hover:shadow-red-500/40 transition-all cursor-pointer group"
          >
            <span>Start Using PDF Tools</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Secondary CTA */}
          <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link
              to="/blog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-slate-700/80 hover:border-slate-600 shadow-md backdrop-blur-sm transition-all cursor-pointer group"
            >
              <BookOpen className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              <span>Browse AI Guides</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Premium Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="max-w-2xl mx-auto mb-14"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-red-400 transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 20+ tools (e.g., merge, compress, ocr, word, rotate)..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#111218]/95 border border-slate-800 shadow-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-red-500/15 focus:border-red-500/80 transition-all text-sm sm:text-base backdrop-blur-md"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-4 hidden sm:flex items-center pointer-events-none">
                <kbd className="px-2 py-1 text-[11px] font-mono text-slate-500 bg-slate-800/80 rounded border border-slate-700/60 shadow-inner">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 max-w-4xl mx-auto"
        >
          {/* Badge 1: Free */}
          <div className="flex items-center justify-start sm:justify-center gap-3 p-3.5 sm:p-4 rounded-[18px] bg-[#111218]/90 border border-slate-800/80 hover:border-slate-700/90 shadow-lg backdrop-blur-md transition-all duration-300 group hover:-translate-y-0.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-bold text-slate-100 leading-tight">Free</span>
              <span className="block text-[11px] text-slate-400 font-medium">100% Free Forever</span>
            </div>
          </div>

          {/* Badge 2: Secure */}
          <div className="flex items-center justify-start sm:justify-center gap-3 p-3.5 sm:p-4 rounded-[18px] bg-[#111218]/90 border border-slate-800/80 hover:border-slate-700/90 shadow-lg backdrop-blur-md transition-all duration-300 group hover:-translate-y-0.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-bold text-slate-100 leading-tight">Secure</span>
              <span className="block text-[11px] text-slate-400 font-medium">In-Browser Memory</span>
            </div>
          </div>

          {/* Badge 3: Privacy First */}
          <div className="flex items-center justify-start sm:justify-center gap-3 p-3.5 sm:p-4 rounded-[18px] bg-[#111218]/90 border border-slate-800/80 hover:border-slate-700/90 shadow-lg backdrop-blur-md transition-all duration-300 group hover:-translate-y-0.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <EyeOff className="w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-bold text-slate-100 leading-tight">Privacy First</span>
              <span className="block text-[11px] text-slate-400 font-medium">Zero Cloud Uploads</span>
            </div>
          </div>

          {/* Badge 4: No Installation */}
          <div className="flex items-center justify-start sm:justify-center gap-3 p-3.5 sm:p-4 rounded-[18px] bg-[#111218]/90 border border-slate-800/80 hover:border-slate-700/90 shadow-lg backdrop-blur-md transition-all duration-300 group hover:-translate-y-0.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HardDriveDownload className="w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-bold text-slate-100 leading-tight">No Installation</span>
              <span className="block text-[11px] text-slate-400 font-medium">Instant Web App</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});


