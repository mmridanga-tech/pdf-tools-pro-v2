import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const PremiumCTA: React.FC = () => {
  const handleScrollToTools = () => {
    const el = document.getElementById('tools-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-12 sm:py-16 bg-[#08090d] border-b border-white/[0.06] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-2xl bg-[#0c0d14] border border-white/[0.08] p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Subtle accent blur */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-600/10 blur-3xl pointer-events-none rounded-full" />

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2"
          >
            Ready to work smarter?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="text-xs sm:text-sm text-slate-400 font-normal max-w-md mx-auto mb-6"
          >
            Simple, private and powerful document workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={handleScrollToTools}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer group shadow-sm"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <Link
              to="/ai-chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 font-medium text-xs sm:text-sm border border-white/[0.08] hover:border-white/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Ask Gemini AI</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


