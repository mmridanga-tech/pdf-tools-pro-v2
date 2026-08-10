import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Sparkles } from 'lucide-react';

const TRUST_PILLARS = [
  {
    title: 'PRIVATE',
    description: 'Local/browser-first document processing. Files remain on your device where supported.',
    icon: Shield,
    iconColor: 'text-slate-300',
  },
  {
    title: 'FAST',
    description: 'Optimized browser and WebAssembly execution for rapid document workflows.',
    icon: Zap,
    iconColor: 'text-slate-300',
  },
  {
    title: 'AI POWERED',
    description: 'Intelligent document workflows using Gemini AI for chat, summaries, and OCR.',
    icon: Sparkles,
    iconColor: 'text-red-400',
  },
];

export const PremiumWhyChoose: React.FC = () => {
  return (
    <section className="relative py-10 sm:py-12 bg-[#08090d] border-b border-white/[0.06] overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-8 sm:mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="text-xl sm:text-2xl font-bold text-white tracking-tight"
          >
            Why SmartPDF AI
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="text-xs sm:text-sm text-slate-400 font-normal mt-1"
          >
            Built for modern document workflows.
          </motion.p>
        </div>

        {/* 3 Connected Pillars with Hairline Separators */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] border-y border-white/[0.08]">
          {TRUST_PILLARS.map((pillar, idx) => {
            const IconComp = pillar.icon;

            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="py-5 md:py-4 md:px-6 lg:px-8 flex flex-col justify-start"
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconComp className={`w-4 h-4 ${pillar.iconColor}`} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


