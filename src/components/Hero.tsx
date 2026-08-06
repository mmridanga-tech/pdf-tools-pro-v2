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
      {/* Lightweight Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.8) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Top Glow Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-red-600/15 via-rose-600/5 to-transparent blur-3xl rounded-full" />

        {/* Animated Ambient Light Orb 1 */}
        <motion.div
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -top-16 left-1/4 w-80 h-80 bg-red-600/20 rounded-full blur-[100px] opacity-60"
        />

        {/* Animated Ambient Light Orb 2 */}
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-12 right-1/4 w-96 h-96 bg-rose-700/15 rounded-full blur-[110px] opacity-50"
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/40 border border-red-800/40 text-xs sm:text-sm font-semibold text-red-400 mb-8 shadow-lg backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
          <span>Next-Gen Client-Side & AI PDF Platform</span>
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
          <button
            onClick={handleStartUsingTools}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-xl shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
          >
            <span>Start Using PDF Tools</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary CTA */}
          <Link
            to="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-slate-700/80 hover:border-slate-600 shadow-md backdrop-blur-sm transition-all cursor-pointer group"
          >
            <BookOpen className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
            <span>Browse AI Guides</span>
          </Link>
        </motion.div>

        {/* Search Box */}
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
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#121319]/90 border border-slate-800 shadow-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm sm:text-base backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {/* Badge 1: Free */}
          <div className="flex items-center justify-center gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md backdrop-blur-md hover:border-slate-700/80 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-bold text-slate-100 leading-tight">Free</span>
              <span className="block text-[11px] text-slate-400 font-medium">100% Free Forever</span>
            </div>
          </div>

          {/* Badge 2: Secure */}
          <div className="flex items-center justify-center gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md backdrop-blur-md hover:border-slate-700/80 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-bold text-slate-100 leading-tight">Secure</span>
              <span className="block text-[11px] text-slate-400 font-medium">In-Browser Memory</span>
            </div>
          </div>

          {/* Badge 3: Privacy First */}
          <div className="flex items-center justify-center gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md backdrop-blur-md hover:border-slate-700/80 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
              <EyeOff className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-bold text-slate-100 leading-tight">Privacy First</span>
              <span className="block text-[11px] text-slate-400 font-medium">Zero Cloud Uploads</span>
            </div>
          </div>

          {/* Badge 4: No Installation */}
          <div className="flex items-center justify-center gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md backdrop-blur-md hover:border-slate-700/80 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
              <HardDriveDownload className="w-4 h-4" />
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


