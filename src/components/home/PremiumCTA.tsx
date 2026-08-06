import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';

export const PremiumCTA: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 bg-[#06070B] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-gradient-to-r from-red-600/20 via-rose-600/15 to-amber-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="relative rounded-[32px] bg-gradient-to-b from-[#121322] via-[#0D0E18] to-[#0A0B12] border border-white/10 hover:border-red-500/30 p-8 sm:p-14 lg:p-20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center backdrop-blur-2xl overflow-hidden group transition-all duration-500">
          {/* Subtle Ambient Beams */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-700" />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs sm:text-sm font-semibold text-red-400 mb-6 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>Ready to Transform Your PDF Experience?</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 max-w-3xl mx-auto leading-[1.1]"
          >
            Start Processing PDFs with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">
              Zero Latency & Total Privacy
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg mb-10 leading-relaxed font-normal"
          >
            Join millions of users using SmartPDF AI for instant document merging, page extraction, OCR, and AI insights. Completely free with no registration required.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <Link
              to="/merge"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-[0_10px_30px_rgba(239,68,68,0.35)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.5)] border border-red-400/40 transition-all duration-300 cursor-pointer group active:scale-[0.98]"
            >
              <Layers className="w-5 h-5 text-white" />
              <span>Merge PDF Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/ai-chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-base border border-white/10 hover:border-white/20 shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer group active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Ask Gemini AI</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
