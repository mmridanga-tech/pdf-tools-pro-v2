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
        {/* Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8 pb-12 border-b border-slate-800/80">
          {/* Column 1: Brand & Core Mission */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-rose-600 to-amber-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-white">
                  <FileText className="w-4.5 h-4.5 text-indigo-400 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight">
                  SmartPDF <span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 ml-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  v2.4
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Enterprise document intelligence running 100% locally in your browser with WebAssembly encryption and Gemini AI analysis.
            </p>

            <div className="flex flex-col gap-1.5 pt-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Zero-Upload Privacy</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 w-fit">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Client-Side AES-256</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <Twitter className="w-3.5 h-3.5" />
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

          {/* Column 5: Newsletter Subscription */}
          <div className="col-span-1 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              <span>Security Updates</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe for changelogs, zero-upload WASM updates & Gemini AI features.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Subscribed successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
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



