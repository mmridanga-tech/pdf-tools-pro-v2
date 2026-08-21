import React from 'react';
import { motion } from 'motion/react';
import { Upload, Cpu, Download, Check } from 'lucide-react';

export interface StepItem {
  number: number;
  label: string;
  description?: string;
}

interface PremiumStepsProps {
  currentStep: 1 | 2 | 3 | number;
  steps?: StepItem[];
  className?: string;
}

const DEFAULT_STEPS: StepItem[] = [
  { number: 1, label: 'Upload File', description: 'Select or drop document' },
  { number: 2, label: 'Process', description: 'WebAssembly & AI engine' },
  { number: 3, label: 'Download', description: 'Save processed document' },
];

export const PremiumSteps: React.FC<PremiumStepsProps> = React.memo(({
  currentStep,
  steps = DEFAULT_STEPS,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-3xl mx-auto mb-10 ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Connecting Line Background */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-white/10 rounded-full pointer-events-none" />

        {/* Connecting Line Progress */}
        <motion.div
          className="absolute top-1/2 left-8 -translate-y-1/2 h-1 bg-gradient-to-r from-red-600 to-rose-500 rounded-full pointer-events-none"
          initial={{ width: '0%' }}
          animate={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xl transition-all duration-300 border ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400/50 shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-gradient-to-br from-red-600 to-rose-600 text-white border-red-400 shadow-red-600/35 ring-4 ring-red-500/20'
                    : 'bg-[#12131F] text-slate-400 border-white/10'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <span>0{step.number}</span>
                )}
              </motion.div>

              <div className="text-center mt-3">
                <span
                  className={`block text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                    isCurrent ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
