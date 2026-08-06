import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Sparkles,
  Zap,
  HardDriveDownload,
  Smartphone,
  Lock,
  EyeOff,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

const FEATURES = [
  {
    title: 'Client-Side Privacy',
    description: 'All document operations execute directly inside your browser memory. Your confidential files never reach external servers.',
    icon: EyeOff,
    badge: '100% On-Device',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    iconBg: 'from-rose-500/20 to-pink-600/10 text-rose-400 border-rose-500/30',
  },
  {
    title: 'Gemini AI Intelligence',
    description: 'Harness advanced Gemini AI for automated OCR text extraction, document summarizing, smart rewriting, and interactive PDF chats.',
    icon: Sparkles,
    badge: 'Gemini Powered',
    badgeColor: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
    iconBg: 'from-purple-500/20 to-indigo-600/10 text-purple-400 border-purple-500/30',
  },
  {
    title: 'WebAssembly Processing',
    description: 'Zero network upload delay. Multi-megabyte PDF merging, splitting, compression, and conversion execute in milliseconds.',
    icon: Zap,
    badge: 'Sub-Second Speed',
    badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    iconBg: 'from-amber-500/20 to-orange-600/10 text-amber-400 border-amber-500/30',
  },
  {
    title: 'Zero Software Installation',
    description: 'Full-featured professional PDF suite available instantly in your browser without desktop downloads or extension setups.',
    icon: HardDriveDownload,
    badge: 'Web Native',
    badgeColor: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
    iconBg: 'from-sky-500/20 to-blue-600/10 text-sky-400 border-sky-500/30',
  },
  {
    title: 'Cross-Platform Unity',
    description: 'Designed fluidly for desktop, tablet, and mobile browsers across macOS, Windows, Linux, iOS, and Android.',
    icon: Smartphone,
    badge: 'All Devices',
    badgeColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
    iconBg: 'from-indigo-500/20 to-blue-600/10 text-indigo-400 border-indigo-500/30',
  },
  {
    title: 'Bank-Grade Security',
    description: 'Encrypt PDFs with 256-bit AES encryption, set printing permissions, and unlock protected documents with full confidence.',
    icon: Lock,
    badge: 'AES 256-Bit',
    badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    iconBg: 'from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30',
  },
];

export const PremiumWhyChoose: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 bg-[#08090E] border-b border-white/[0.08] overflow-hidden">
      {/* Soft Background Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-600/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-red-400 mb-4 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>Architected for Modern Teams</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-5"
          >
            Why Millions Trust SmartPDF AI
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal"
          >
            Combining local WebAssembly execution with cloud AI capabilities to deliver unmatched security, speed, and document precision.
          </motion.p>
        </div>

        {/* Bento / Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((feature, idx) => {
            const IconComp = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group relative p-8 rounded-[24px] bg-[#10111A]/90 hover:bg-[#151624] border border-white/10 hover:border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 backdrop-blur-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${feature.iconBg} border flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className="w-6.5 h-6.5" />
                    </div>

                    <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-red-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-300/80 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Client Architecture</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
