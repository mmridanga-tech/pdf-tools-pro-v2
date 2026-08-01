import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ProtectPDF } from './ProtectPDF';
import { UnlockPDF } from './UnlockPDF';
import { ShieldCheck, Lock, Unlock } from 'lucide-react';

export const SecurityPDF: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'protect' | 'unlock'>('protect');

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Sub Navigation Bar for Security Tools */}
      <div className="border-b border-slate-800/80 bg-[#0D0D10]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span>PDF Security Suite</span>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('protect')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'protect'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Protect PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unlock')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'unlock'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Tool */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'protect' ? <ProtectPDF /> : <UnlockPDF />}
      </motion.div>
    </div>
  );
};
