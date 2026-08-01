import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface CardProps extends HTMLMotionProps<'div'> {
  hoverEffect?: boolean;
  activeBorder?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  hoverEffect = false,
  activeBorder = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={`bg-[#141417] rounded-2xl border ${
        activeBorder
          ? 'border-red-500/50 shadow-lg shadow-red-500/10'
          : 'border-slate-800/80 hover:border-slate-700/80'
      } p-6 transition-all ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
