import React from 'react';
import { Link } from 'react-router-dom';
import { FileCode, Shield, Zap, Lock, Heart, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070708] text-slate-400 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold shadow-md">
                P
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                PDF Tools <span className="text-red-500">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Fast, secure, and private PDF utility suite powered by browser-native WebAssembly & JavaScript.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero server file transfers</span>
            </div>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Popular Tools
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/merge" className="hover:text-red-400 transition-colors">
                  Merge PDF Files
                </Link>
              </li>
              <li>
                <Link to="/split" className="hover:text-red-400 transition-colors">
                  Split PDF Document
                </Link>
              </li>
              <li>
                <Link to="/compress" className="hover:text-red-400 transition-colors">
                  Compress PDF Size
                </Link>
              </li>
              <li>
                <Link to="/rotate" className="hover:text-red-400 transition-colors">
                  Rotate PDF Pages
                </Link>
              </li>
            </ul>
          </div>

          {/* Conversions */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Conversions
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/pdf-to-word" className="hover:text-red-400 transition-colors">
                  PDF to Word (DOCX)
                </Link>
              </li>
              <li>
                <Link to="/word-to-pdf" className="hover:text-red-400 transition-colors">
                  Word to PDF
                </Link>
              </li>
              <li>
                <Link to="/watermark" className="hover:text-red-400 transition-colors">
                  Watermark PDF
                </Link>
              </li>
              <li>
                <Link to="/page-numbers" className="hover:text-red-400 transition-colors">
                  Add Page Numbers
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Guarantees */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Why PDF Tools Pro?
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Instant client-side processing without upload queues</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>100% GDPR and HIPAA private - files stay on device</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>No limits, no subscriptions, no registration required</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PDF Tools Pro. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with precision for seamless PDF productivity</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
