import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Github,
  Linkedin,
  Twitter,
  Heart,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Mail,
} from 'lucide-react';

export const Footer: React.FC = React.memo(() => {
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <footer className="relative bg-[#070A11] text-slate-400 border-t border-slate-800/80 pt-16 pb-12 overflow-hidden select-none">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Newsletter & Privacy Trust Banner */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>Next-Gen Gemini 3.7 AI & WASM Security</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1.5">
              Stay ahead with zero-upload document processing
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              Get monthly updates on new local WebAssembly tools, enterprise OCR models, and privacy standards.
            </p>
          </div>

          {/* Subscribe Form */}
          <div className="w-full lg:w-auto min-w-[280px] sm:min-w-[340px]">
            {subscribed ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! You are subscribed to SmartPDF updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-800/80">
          {/* Column 1: Brand & Core Mission */}
          <div className="col-span-2 space-y-4 pr-0 lg:pr-6">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-rose-600 to-amber-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-white">
                  <FileText className="w-4.5 h-4.5 text-indigo-400 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight">
                  SmartPDF <span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 ml-2 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  v2.4
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-normal max-w-sm">
              Enterprise-grade document intelligence platform running 100% locally in your browser with WebAssembly encryption, multi-format conversion, and Gemini AI analysis.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Zero-Upload Privacy</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Client-Side AES</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Popular Tools */}
          <div className="col-span-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>PDF Tools</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-normal">
              <li>
                <Link to="/merge" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link to="/split" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link to="/compress" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link to="/pdf-to-word" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  PDF to Word
                </Link>
              </li>
              <li>
                <Link to="/word-to-pdf" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Word to PDF
                </Link>
              </li>
              <li>
                <Link to="/image-to-pdf" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Images to PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: AI & Intelligence */}
          <div className="col-span-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Intelligence</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-normal">
              <li>
                <Link to="/ai-chat" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  AI PDF Chat
                </Link>
              </li>
              <li>
                <Link to="/document-analyzer" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Risk Analyzer
                </Link>
              </li>
              <li>
                <Link to="/diff-compare" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  AI Diff Compare
                </Link>
              </li>
              <li>
                <Link to="/resume-reviewer" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Resume Reviewer
                </Link>
              </li>
              <li>
                <Link to="/pii-redaction" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  PII Redaction
                </Link>
              </li>
              <li>
                <Link to="/flashcard-quiz" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Quiz & Flashcards
                </Link>
              </li>
              <li>
                <Link to="/invoice-processor" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Invoice Processor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Legal */}
          <div className="col-span-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              <span>Company & Trust</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-normal">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  About SmartPDF
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-indigo-300 transition-colors block">
                  Support & Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="font-medium">
            © {new Date().getFullYear()} SmartPDF AI. Client-Side Security First. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for secure document workflows</span>
          </p>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>v2.4.0 (Active)</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
});



