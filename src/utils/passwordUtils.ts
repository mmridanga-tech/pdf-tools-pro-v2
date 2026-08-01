export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  barColor: string;
  suggestions: string[];
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'text-slate-500',
      barColor: 'bg-slate-700',
      suggestions: ['Enter at least 6 characters'],
    };
  }

  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('Use at least 8 characters');
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Add at least one number');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Add a special character (!@#$%^&*)');
  }

  let label: PasswordStrength['label'] = 'Weak';
  let color = 'text-red-400';
  let barColor = 'bg-red-500';

  if (score === 2) {
    label = 'Fair';
    color = 'text-amber-400';
    barColor = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'text-blue-400';
    barColor = 'bg-blue-500';
  } else if (score >= 4) {
    label = 'Strong';
    color = 'text-emerald-400';
    barColor = 'bg-emerald-500';
  }

  return { score, label, color, barColor, suggestions };
}
