import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Lock } from 'lucide-react';

export const PremiumCTA: React.FC = () => {
  const handleScrollToTools = () => {
    const el = document.getElementById('tools-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-16 sm:py-24 bg-[#08090d] border-b border-white/[0.06] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-b from-[#10121e] to-[#0a0b12] border border-white/[0.1] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          {/* Subtle accent blur */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-600/15 blur-3xl pointer-events-none rounded-full" />

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-semibold text-slate-300 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Instant & Secure Document Workflow</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3"
          >
            Transform Documents in Seconds — With Zero Data Leaks
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="text-xs sm:text-base text-slate-400 font-normal max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Join thousands of professionals, students, and businesses who rely on SmartPDF AI for private, ultra-fast client-side document processing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8"
          >
            <button
              onClick={handleScrollToTools}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer group shadow-lg shadow-red-600/25"
            >
              <span>Explore All PDF Tools</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              to="/ai-chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-semibold text-xs sm:text-sm border border-white/[0.1] hover:border-white/20 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>Launch Gemini AI Chat</span>
            </Link>
          </motion.div>

          {/* Micro trust points */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-6 border-t border-white/[0.06] text-slate-400 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% In-Browser Privacy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Zero Queue Waiting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>No Account Required to Start</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



