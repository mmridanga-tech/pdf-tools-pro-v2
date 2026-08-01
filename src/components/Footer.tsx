import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Sparkles, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070708] text-slate-400 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-extrabold shadow-md">
                S
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                SmartPDF <span className="text-red-500">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Enterprise PDF productivity suite with WebAssembly client conversion, Gemini AI Document Chat, OCR text extraction, and secure Team Workspaces.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Ephemeral RAM purge & SSL 256-bit encryption</span>
            </div>
          </div>

          {/* AI & Platform Tools */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              AI & Power Tools
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/ai-chat" className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-3 h-3" /> AI PDF Chat
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-purple-400">
                  <Zap className="w-3 h-3" /> AI Assistant Suite
                </Link>
              </li>
              <li>
                <Link to="/ocr-pdf" className="hover:text-red-400 transition-colors">
                  OCR Text Extractor
                </Link>
              </li>
              <li>
                <Link to="/cloud-storage" className="hover:text-red-400 transition-colors">
                  Cloud Drive Sync
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-red-400 transition-colors">
                  Team Workspaces
                </Link>
              </li>
            </ul>
          </div>

          {/* Utility Suite */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Image Tools
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/image-to-pdf" className="hover:text-red-400 transition-colors">
                  Image to PDF
                </Link>
              </li>
              <li>
                <Link to="/pdf-to-image" className="hover:text-red-400 transition-colors">
                  PDF to Image
                </Link>
              </li>
              <li>
                <Link to="/compress-image" className="hover:text-red-400 transition-colors">
                  Compress Image
                </Link>
              </li>
              <li>
                <Link to="/resize-image" className="hover:text-red-400 transition-colors">
                  Resize Image
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Legal */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Support & Legal
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/help" className="hover:text-red-400 transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-red-400 transition-colors">
                  Settings & Preferences
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-red-400 transition-colors">
                  About SmartPDF
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-red-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-red-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-red-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-red-400 transition-colors">
                  Legal Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SmartPDF AI Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Production-grade commercial platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
