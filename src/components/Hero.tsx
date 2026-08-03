import React from 'react';
import { Search, ShieldCheck, Zap, Lock, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = React.memo(({ searchQuery, onSearchChange }) => {
  return (
    <section className="relative pt-14 pb-16 md:pt-24 md:pb-24 bg-[#0A0A0B] overflow-hidden border-b border-slate-800/60">
      {/* Background ambient lighting circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-25">
        <div className="absolute -top-12 left-1/4 w-80 h-80 bg-red-600 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-16 right-1/4 w-96 h-96 bg-rose-900/60 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-red-400 mb-6 shadow-md backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>All-in-One Client-Side PDF Suite</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-6"
        >
          Every tool you need to <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
            edit, merge & convert
          </span>{' '}
          PDFs
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10 leading-relaxed font-normal"
        >
          100% free online PDF tools. Merge, split, compress, convert, rotate, OCR, and format your PDF documents directly in your browser with enterprise-grade privacy.
        </motion.p>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="max-w-xl mx-auto mb-10"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search PDF tools (e.g., merge, compress, ocr, word)..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#141417] border border-slate-800/80 shadow-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/80 transition-all text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Value Props / Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-slate-400 font-medium"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Private & Secure</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Instant Client Processing</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
            <Lock className="w-4 h-4 text-red-400" />
            <span>Zero File Storage</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

