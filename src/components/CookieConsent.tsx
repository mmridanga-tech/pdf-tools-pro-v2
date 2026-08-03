import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cookie, Settings2, Check, X, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_PREFS_KEY = 'smartpdf_cookie_consent_v1';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_PREFS_KEY);
      if (!stored) {
        // Show after brief delay
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(allAccepted));
    setVisible(false);
    setShowCustomizeModal(false);
  };

  const handleRejectNonEssential = () => {
    const onlyEssential = { essential: true, analytics: false, marketing: false };
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(onlyEssential));
    setVisible(false);
    setShowCustomizeModal(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(prefs));
    setVisible(false);
    setShowCustomizeModal(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Floating Bottom Cookie Banner */}
      <AnimatePresence>
        {visible && !showCustomizeModal && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-xl z-50 bg-[#121215]/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    We value your privacy
                  </h4>
                  <button
                    onClick={handleRejectNonEssential}
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  SmartPDF uses cookies and browser storage to optimize document processing, analytics, and service functionality. Read our{' '}
                  <Link to="/cookies" className="text-red-400 underline hover:text-red-300">
                    Cookie Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-red-400 underline hover:text-red-300">
                    Privacy Policy
                  </Link>.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleRejectNonEssential}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setShowCustomizeModal(true)}
                    className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Customize
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customize Preferences Modal */}
      <AnimatePresence>
        {showCustomizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121215] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-extrabold text-white">Cookie Preferences</h3>
                </div>
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Essential Cookies */}
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" /> Strictly Essential
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Required for session state, PDF conversions, and security tokens.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Always On
                  </span>
                </div>

                {/* Analytics Cookies */}
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">Performance & Analytics</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Help us improve conversion speed, tool stability, and usability metrics.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>

                {/* Marketing Cookies */}
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">Personalization & Feature Discovery</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Customize feature highlights and relevant recommendations.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.marketing}
                    onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-4">
                <button
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Reject Optional
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
