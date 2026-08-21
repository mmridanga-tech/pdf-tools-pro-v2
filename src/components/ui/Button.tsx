import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 border border-red-500/30 focus-visible:ring-2 focus-visible:ring-red-400',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400',
  danger:
    'bg-rose-700 hover:bg-rose-600 text-white shadow-lg shadow-rose-700/20 border border-rose-600/30 focus-visible:ring-2 focus-visible:ring-rose-400',
  outline:
    'bg-transparent border border-slate-700 hover:border-slate-500 hover:bg-slate-800/60 text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent hover:bg-slate-800/80 text-slate-300 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base font-bold rounded-2xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.015 }}
      whileTap={isDisabled ? undefined : { scale: 0.985 }}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center transition-all outline-none font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
};
