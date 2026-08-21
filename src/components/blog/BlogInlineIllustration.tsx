import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  ArrowRight,
  Layers,
  Minimize2,
  Lock,
  ScanText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap
} from 'lucide-react';

export type IllustrationType = 'conversion' | 'merging' | 'compression' | 'security' | 'ocr' | 'ai';

interface BlogInlineIllustrationProps {
  type: IllustrationType;
  title?: string;
  caption?: string;
}

export const BlogInlineIllustration: React.FC<BlogInlineIllustrationProps> = ({
  type,
  title,
  caption,
}) => {
  if (type === 'conversion') {
    return (
      <figure className="my-8 rounded-2xl bg-[#0E0F12] border border-slate-800/90 p-5 sm:p-6 shadow-xl no-print overflow-hidden">
        <figcaption className="sr-only">
          {title || 'Visual Workflow: High-Fidelity PDF to Word Conversion Pipeline'}
        </figcaption>
        <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {title || 'Visual Workflow: High-Fidelity PDF to Word Conversion Pipeline'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            SmartPDF AI Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center">
          {/* Step 1: Input PDF */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white">1. Input PDF</span>
            <span className="text-[11px] text-slate-400">Vector graphics, tables, embedded fonts</span>
          </div>

          {/* Step 2: Processing Engine */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-red-500/30 flex flex-col items-center space-y-2 shadow-lg relative">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-red-300">2. Smart Layout Engine</span>
            <span className="text-[11px] text-slate-400">Font matching & exact spatial positioning</span>
          </div>

          {/* Step 3: Output Word Docx */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white">3. Editable DOCX</span>
            <span className="text-[11px] text-slate-400">100% editable layout preservation</span>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center italic">
          {caption || 'Zero server uploads needed. All document parsing happens directly in your browser.'}
        </p>
      </figure>
    );
  }

  if (type === 'merging') {
    return (
      <figure className="my-8 rounded-2xl bg-[#0E0F12] border border-slate-800/90 p-5 sm:p-6 shadow-xl no-print overflow-hidden">
        <figcaption className="sr-only">
          {title || 'Visual Flow: Multi-Document Assembly & Merging Engine'}
        </figcaption>
        <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {title || 'Visual Flow: Multi-Document Assembly & Merging Engine'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            Stream Stacking
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <FileText className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">Doc_A.pdf</span>
            </div>
            <span className="text-slate-500 font-bold text-xs">+</span>
            <div className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <FileText className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">Doc_B.pdf</span>
            </div>
            <span className="text-slate-500 font-bold text-xs">+</span>
            <div className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <FileText className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">Doc_C.pdf</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center text-red-500">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/40 flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Merged_Master.pdf</span>
              <span className="text-[11px] text-slate-400">Lossless page stream combine</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center italic">
          {caption || 'Order pages precisely with drag-and-drop before creating the consolidated output.'}
        </p>
      </figure>
    );
  }

  if (type === 'compression') {
    return (
      <figure className="my-8 rounded-2xl bg-[#0E0F12] border border-slate-800/90 p-5 sm:p-6 shadow-xl no-print overflow-hidden">
        <figcaption className="sr-only">
          {title || 'Visual Flow: Lossless Compression & Vector Resampling'}
        </figcaption>
        <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Minimize2 className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {title || 'Visual Flow: Lossless Compression & Vector Resampling'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-800/50">
            ~80% Size Reduction
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">Original File</span>
              <span className="text-sm font-black text-slate-200">18.5 MB</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Uncompressed image objects</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block">Optimized Output</span>
              <span className="text-sm font-black text-white">2.8 MB</span>
              <span className="text-[11px] text-emerald-300/80 block mt-0.5">Stream-compressed & web ready</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center italic">
          {caption || 'Removes redundant metadata and resamples heavy embedded bitmaps while preserving crisp text vectors.'}
        </p>
      </figure>
    );
  }

  if (type === 'security') {
    return (
      <figure className="my-8 rounded-2xl bg-[#0E0F12] border border-slate-800/90 p-5 sm:p-6 shadow-xl no-print overflow-hidden">
        <figcaption className="sr-only">
          {title || 'Visual Security: AES-256 Bit Client-Side PDF Encryption'}
        </figcaption>
        <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lock className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {title || 'Visual Security: AES-256 Bit Client-Side PDF Encryption'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-800/50">
            AES-256 Verified
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Client-Side Password Lock</span>
              <span className="text-[11px] text-slate-300">
                Encryption keys are generated in your browser memory and never sent over the network.
              </span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono shrink-0">
            ••••••••••••
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center italic">
          {caption || 'Compliant with enterprise data privacy standards (GDPR, HIPAA, ISO27001).'}
        </p>
      </figure>
    );
  }

  if (type === 'ocr') {
    return (
      <figure className="my-8 rounded-2xl bg-[#0E0F12] border border-slate-800/90 p-5 sm:p-6 shadow-xl no-print overflow-hidden">
        <figcaption className="sr-only">
          {title || 'Visual Process: Optical Character Recognition (OCR) Engine'}
        </figcaption>
        <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ScanText className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {title || 'Visual Process: Optical Character Recognition (OCR) Engine'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 bg-purple-950/30 px-2.5 py-1 rounded-full border border-purple-800/50">
            Tesseract Neural OCR
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block">1. Scanned Image</span>
            <span className="text-xs font-bold text-slate-300 mt-1 block">Image Bitmap</span>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
            <span className="text-[10px] font-mono text-purple-400 block">2. Glyph Analysis</span>
            <span className="text-xs font-bold text-white mt-1 block">Pattern Matching</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block">3. Digital Output</span>
            <span className="text-xs font-bold text-emerald-400 mt-1 block">Selectable PDF Text</span>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center italic">
          {caption || 'Extracts editable text from scanned contracts, invoices, receipts, and handwritten notes.'}
        </p>
      </figure>
    );
  }

  // Fallback: AI
  return (
    <figure className="my-8 rounded-2xl bg-[#0E0F12] border border-slate-800/90 p-5 sm:p-6 shadow-xl no-print overflow-hidden">
      <figcaption className="sr-only">
        {title || 'Visual Architecture: AI Neural Document Summarization & Chat'}
      </figcaption>
      <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs sm:text-sm font-bold text-white">
            {title || 'Visual Architecture: AI Neural Document Summarization & Chat'}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950/30 px-2.5 py-1 rounded-full border border-sky-800/50">
          Gemini AI Core
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Interactive AI PDF Chat & Key Takeaways</span>
            <span className="text-[11px] text-slate-400">Ask questions, extract bullet points, or generate executive summaries in seconds.</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-400 text-center italic">
        {caption || 'Intelligent contextual understanding powered by state-of-the-art document AI models.'}
      </p>
    </figure>
  );
};
