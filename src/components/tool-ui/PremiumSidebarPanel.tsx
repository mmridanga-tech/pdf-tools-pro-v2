import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Zap,
  FileCheck2,
  HelpCircle,
  EyeOff,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

interface PremiumSidebarPanelProps {
  toolName?: string;
  tips?: string[];
  supportedFormats?: string[];
  maxSizeMB?: number;
  className?: string;
}

export const PremiumSidebarPanel: React.FC<PremiumSidebarPanelProps> = React.memo(({
  toolName = 'SmartPDF AI Tool',
  tips = [
    'Drag & drop files directly anywhere on the upload zone.',
    'Reorder files before merging or converting for exact page order.',
    'All processing completes inside your browser memory for maximum privacy.',
  ],
  supportedFormats = ['PDF (.pdf)', 'Word (.docx, .doc)', 'Images (.png, .jpg)'],
  maxSizeMB = 100,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Privacy & Security Card */}
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 rounded-[24px] bg-[#12131F]/90 border border-white/10 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">100% On-Device Security</h4>
            <span className="text-[11px] text-emerald-400 font-semibold">Zero Server Uploads</span>
          </div>
        </div>
        <p className="text-xs text-slate-300/80 leading-relaxed font-normal">
          Your documents are parsed and processed completely in local browser RAM using WebAssembly. Files never leave your device.
        </p>
      </motion.div>

      {/* Pro Tips Card */}
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="p-6 rounded-[24px] bg-[#12131F]/90 border border-white/10 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Pro Tips for {toolName}</h4>
        </div>

        <ul className="space-y-3">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300/90 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Specs & Supported Formats Card */}
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className="p-6 rounded-[24px] bg-[#12131F]/90 border border-white/10 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Specifications</h4>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="block text-slate-400 text-[11px] font-medium mb-1">Supported Formats:</span>
            <div className="flex flex-wrap gap-1.5">
              {supportedFormats.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-200 text-[11px] font-mono font-semibold"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-slate-300">
            <span>Max File Size:</span>
            <span className="font-mono font-bold text-white">{maxSizeMB} MB</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Engine:</span>
            <span className="font-mono font-bold text-red-400">WebAssembly + Gemini</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
