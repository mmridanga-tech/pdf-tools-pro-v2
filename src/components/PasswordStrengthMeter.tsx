import React from 'react';
import { evaluatePasswordStrength } from '../utils/passwordUtils';
import { ShieldAlert, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const strength = evaluatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-3 p-3.5 bg-[#18181C] border border-slate-800 rounded-xl space-y-2.5 transition-all">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-400 flex items-center gap-1.5">
          {strength.score >= 3 ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          )}
          Password Strength:
        </span>
        <span className={`${strength.color} font-bold tracking-wide`}>
          {strength.label}
        </span>
      </div>

      {/* 4-level progress bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-full rounded-full transition-all duration-300 ${
              level <= strength.score ? strength.barColor : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Suggestions if any */}
      {strength.suggestions.length > 0 && (
        <div className="pt-1 border-t border-slate-800/60">
          <ul className="space-y-1">
            {strength.suggestions.map((suggestion, index) => (
              <li key={index} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-500" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {strength.score >= 3 && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Password meets security standards.
        </div>
      )}
    </div>
  );
};
