import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface OcrConfidenceIndicatorProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const OcrConfidenceIndicator: React.FC<OcrConfidenceIndicatorProps> = ({
  confidence,
  size = 'md',
  showLabel = true,
}) => {
  const getConfidenceLevel = (score: number) => {
    if (score >= 85) {
      return {
        label: 'High Accuracy',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        icon: ShieldCheck,
        description: 'Scanned characters were recognized with over 85% accuracy.',
      };
    } else if (score >= 70) {
      return {
        label: 'Good Accuracy',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        icon: AlertTriangle,
        description: 'Moderate scan quality. Check specific numbers or faint words.',
      };
    } else {
      return {
        label: 'Low Quality Scan',
        bg: 'bg-red-500/15',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: ShieldAlert,
        description: 'Faint or low resolution scan. Enhance resolution option recommended.',
      };
    }
  };

  const level = getConfidenceLevel(confidence);
  const Icon = level.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-4 py-2 text-sm font-bold gap-2',
  };

  return (
    <div
      className={`inline-flex items-center rounded-xl border ${level.bg} ${level.border} ${level.text} ${sizeClasses[size]}`}
      title={level.description}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{confidence}%</span>
      {showLabel && <span className="opacity-80 font-normal">({level.label})</span>}
    </div>
  );
};
