import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Lock,
  Upload,
  FileText,
  Layers,
  Minimize2,
  ScanText,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

interface PremiumHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const QUICK_ACTIONS = [
  { name: 'Merge PDF', path: '/merge', icon: Layers, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' },
  { name: 'Compress PDF', path: '/compress', icon: Minimize2, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
  { name: 'PDF to Word', path: '/pdf-to-word', icon: FileText, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10' },
  { name: 'AI Document Chat', path: '/ai-chat', icon: Sparkles, color: 'text-rose-400 border-rose-500/20 bg-rose-500/10' },
  { name: 'OCR PDF', path: '/ocr-pdf', icon: ScanText, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' },
  { name: 'Protect PDF', path: '/protect-pdf', icon: Lock, color: 'text-blue-400 border-blue-500/20 bg-blue-500/10' },
];

const TRUST_STATS = [
  { value: '100%', label: 'Client-Side Privacy', desc: 'Zero server uploads', icon: Shield },
  { value: '25+', label: 'Pro PDF Tools', desc: 'Complete browser suite', icon: Layers },
  { value: '< 1s', label: 'WASM Speed', desc: 'Instant local processing', icon: Zap },
  { value: 'AI Ready', label: 'Gemini 2.5 Intelligence', desc: 'Summaries, chat & OCR', icon: Sparkles },
];

export const PremiumHero: React.FC<PremiumHeroProps> = React.memo(({ searchQuery, onSearchChange }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setDroppedFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setDroppedFile(file);
    }
  }, []);

  const handleStartExploring = () => {
    const el = document.getElementById('tools-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 480, behavior: 'smooth' });
    }
  };

  const handleToolRedirect = (path: string) => {
    navigate(path);
  };

  return (
    <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 bg-[#08090D] overflow-hidden border-b border-white/[0.06]">
      {/* Background Soft Ambient Gradient & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.8) 1px, transparent 0)`,
            backgroundSize: '36px 36px',
          }}
        />
        {/* Soft, restrained warm rose/red ambient backlight */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-red-600/12 via-rose-500/6 to-transparent blur-[140px] rounded-full pointer-events-none" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-slate-300 mb-5 tracking-wide backdrop-blur-md shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-slate-200">100% Client-Side Privacy</span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400">Zero Server Uploads</span>
            <span className="text-white/20">•</span>
            <span className="text-red-400 font-semibold">Gemini AI</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-3.5xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-4"
          >
            All-in-One PDF Suite.{' '}
            <span className="bg-gradient-to-r from-white via-slate-100 to-red-400 bg-clip-text text-transparent">
              Fast, Private, Limitless.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal mb-8 max-w-xl mx-auto"
          >
            Merge, split, compress, convert, OCR, edit, and chat with your documents using WebAssembly and Gemini AI—directly in your browser with zero latency.
          </motion.p>

          {/* Search Bar + Keyboard Trigger */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.14 }}
            className="max-w-xl mx-auto mb-5"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-red-400 transition-colors" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search PDF tools (e.g. compress, merge, word, ocr, protect)..."
                className="w-full pl-10 pr-14 py-3 rounded-2xl bg-[#0e0f16] border border-white/[0.1] shadow-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all text-xs sm:text-sm font-normal"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute inset-y-0 right-0 pr-3.5 hidden sm:flex items-center pointer-events-none">
                  <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.04] rounded-md border border-white/[0.1]">
                    ⌘K
                  </kbd>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Action Suggestion Chips */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="flex items-center justify-center flex-wrap gap-2 mb-8"
          >
            <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">Popular:</span>
            {QUICK_ACTIONS.map((item) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium text-slate-300 hover:text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${item.color}`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </motion.div>

          {/* Interactive Fast Dropzone / File Launch Widget */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22 }}
            className="max-w-2xl mx-auto"
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative rounded-2xl border-2 border-dashed p-6 sm:p-7
                transition-all duration-200 cursor-pointer text-center
                ${
                  isDragging
                    ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10 scale-[1.01]'
                    : 'border-white/[0.1] bg-[#0c0d14]/80 hover:bg-[#10121c] hover:border-white/[0.18]'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!droppedFile ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 shadow-inner group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      <span className="text-red-400">Click to upload</span> or drag and drop your PDF here
                    </p>
                    <p className="text-xs text-slate-500">
                      Files are processed locally in your browser memory • 100% confidential
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>File Selected: {droppedFile.name} ({(droppedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <p className="text-xs text-slate-400">Choose what you would like to do with this document:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToolRedirect('/compress');
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Compress File
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToolRedirect('/pdf-to-word');
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Convert to Word
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToolRedirect('/ai-chat');
                      }}
                      className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      AI Document Chat
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToolRedirect('/ocr-pdf');
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Run OCR Text
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.26 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          >
            <button
              onClick={handleStartExploring}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-red-600/20 transition-all duration-150 cursor-pointer group active:scale-[0.98]"
            >
              <span>Explore All 25+ PDF Tools</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <Link
              to="/ai-chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-semibold text-xs sm:text-sm border border-white/[0.08] hover:border-white/20 transition-all duration-150 cursor-pointer group active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>Try Gemini AI Document Chat</span>
            </Link>
          </motion.div>
        </div>

        {/* 4 Trust Metrics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="mt-14 pt-8 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto"
        >
          {TRUST_STATS.map((stat) => {
            const IconComp = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-red-400 shrink-0">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-slate-300 leading-tight mt-0.5">
                    {stat.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {stat.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
});

PremiumHero.displayName = 'PremiumHero';


