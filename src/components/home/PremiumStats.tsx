import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Sparkles, Cpu, Lock } from 'lucide-react';

const STATS = [
  {
    value: '5M+',
    label: 'Documents Processed',
    description: 'Trusted by professionals worldwide for fast document operations.',
    icon: Cpu,
    color: 'from-red-500 to-rose-400',
    borderColor: 'border-red-500/30',
  },
  {
    value: '100%',
    label: 'On-Device Privacy',
    description: 'Files are processed inside browser memory. Zero server uploads.',
    icon: ShieldCheck,
    color: 'from-emerald-400 to-teal-300',
    borderColor: 'border-emerald-500/30',
  },
  {
    value: '0 ms',
    label: 'Server Network Delay',
    description: 'Blazing fast WebAssembly execution right on your CPU.',
    icon: Zap,
    color: 'from-amber-400 to-yellow-300',
    borderColor: 'border-amber-500/30',
  },
  {
    value: '99.9%',
    label: 'OCR & AI Accuracy',
    description: 'Gemini AI intelligence for exact text, layout, and table analysis.',
    icon: Sparkles,
    color: 'from-purple-400 to-indigo-300',
    borderColor: 'border-purple-500/30',
  },
];

export const PremiumStats: React.FC = () => {
  return (
    <section className="relative py-10 sm:py-12 bg-[#06070B] border-y border-white/[0.08] overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-red-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-red-400 mb-3 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Built for Uncompromising Performance</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
          >
            Engineered for Scale & Absolute Security
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STATS.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className={`p-5.5 sm:p-6 rounded-[20px] bg-[#0E0F18]/90 border ${stat.borderColor} shadow-2xl backdrop-blur-xl relative overflow-hidden group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tracking-tight`}>
                    {stat.value}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <IconComponent className="w-4.5 h-4.5 text-slate-300" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5 tracking-tight">
                  {stat.label}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
