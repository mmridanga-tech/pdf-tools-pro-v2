import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Sparkles, Lock, Cpu, Database, Check, X, ShieldAlert } from 'lucide-react';

const ARCHITECTURE_PILLARS = [
  {
    title: '100% Client-Side Sandbox',
    subtitle: 'Zero Cloud Uploads',
    description: 'All core PDF transformations run locally inside your browser memory via WebAssembly. Your sensitive files and private records never touch external servers.',
    icon: ShieldCheck,
    badge: 'Privacy First',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    bgColor: 'bg-emerald-500/5',
  },
  {
    title: 'WASM High Performance',
    subtitle: 'Instant Execution',
    description: 'No uploading or downloading gigabyte streams over slow networks. High-throughput PDF rendering and compilation happen in milliseconds on your device.',
    icon: Zap,
    badge: 'Zero Latency',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    bgColor: 'bg-amber-500/5',
  },
  {
    title: 'Gemini 2.5 AI Document Engine',
    subtitle: 'Deep Semantic Reasoning',
    description: 'Converse with 100+ page contracts, synthesize executive summaries, extract tabular datasets into Excel, and OCR scanned pages with pinpoint accuracy.',
    icon: Sparkles,
    badge: 'Next-Gen AI',
    iconColor: 'text-rose-400',
    borderColor: 'border-rose-500/20',
    bgColor: 'bg-rose-500/5',
  },
  {
    title: 'Enterprise Encryption',
    subtitle: 'AES-256 & Permission Controls',
    description: 'Protect confidential PDFs with military-grade 256-bit encryption. Restrict printing, copying, and page extraction without storing master keys remotely.',
    icon: Lock,
    badge: 'Enterprise Grade',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    bgColor: 'bg-blue-500/5',
  },
];

const COMPARISON_POINTS = [
  {
    feature: 'File Security & Privacy',
    smartpdf: '100% Local In-Browser Processing (Zero server uploads)',
    traditional: 'Uploaded & stored on third-party remote cloud servers',
  },
  {
    feature: 'Processing Speed',
    smartpdf: 'Instant WebAssembly execution (No upload delay)',
    traditional: 'Slow upload, queue wait time & slow re-download',
  },
  {
    feature: 'File Size Limits',
    smartpdf: 'Virtually unlimited (bound only by local RAM)',
    traditional: 'Strict 10MB–25MB free tier caps & paywalls',
  },
  {
    feature: 'AI Document Intelligence',
    smartpdf: 'Built-in Gemini AI Chat, Summarizer & Table OCR',
    traditional: 'Expensive monthly subscriptions or non-existent',
  },
];

export const PremiumWhyChoose: React.FC = () => {
  return (
    <section className="relative py-16 sm:py-24 bg-[#08090d] border-b border-white/[0.06] overflow-hidden">
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 z-10 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-semibold text-slate-300 mb-3"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Architecture & Security</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight"
          >
            Engineered for Uncompromising Privacy & Speed
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="text-xs sm:text-sm text-slate-400 font-normal mt-2 leading-relaxed"
          >
            Unlike legacy PDF websites that upload your confidential contracts and private documents to third-party servers, SmartPDF AI processes documents entirely inside your browser's local sandbox.
          </motion.p>
        </div>

        {/* 4 Feature Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {ARCHITECTURE_PILLARS.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: idx * 0.06 }}
                className={`flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-[#0c0d14] border ${pillar.borderColor} transition-all duration-200 hover:border-white/20`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${pillar.bgColor} border ${pillar.borderColor} flex items-center justify-center ${pillar.iconColor}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mb-2.5">
                    {pillar.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Privacy & Performance Comparison Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-[#0c0d14] border border-white/[0.08] p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          <div className="max-w-xl mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              SmartPDF AI vs. Traditional Cloud Converters
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              See why privacy-conscious professionals and teams choose client-side WebAssembly execution.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 pr-4 font-semibold">Capability</th>
                  <th className="py-3 px-4 font-bold text-emerald-400 bg-emerald-500/[0.04] rounded-t-xl">
                    SmartPDF AI (Browser-First)
                  </th>
                  <th className="py-3 pl-4 font-semibold text-slate-500">
                    Traditional Online Converters
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {COMPARISON_POINTS.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-white">
                      {pt.feature}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-emerald-300 bg-emerald-500/[0.03]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{pt.smartpdf}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pl-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-500/80 shrink-0" />
                        <span>{pt.traditional}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};



