import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3.5 text-slate-400 pointer-events-none">{icon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#0D0D0F] border ${
              error ? 'border-red-500 focus:ring-red-500/30' : 'border-slate-800 focus:border-red-500 focus:ring-red-500/20'
            } text-slate-100 placeholder-slate-500 rounded-xl ${
              icon ? 'pl-10' : 'px-4'
            } py-3 text-sm focus:outline-none focus:ring-2 transition-all ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs font-semibold text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
