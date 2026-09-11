import React from 'react';

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'default';
  className?: string;
  glow?: boolean;
}

export const CyberCard: React.FC<CyberCardProps> = ({
  children,
  variant = 'default',
  className = '',
  glow = false,
  ...props
}) => {
  let borderClass = 'border-slate-800/80';
  let glowClass = '';

  if (variant === 'cyan') {
    borderClass = 'border-cyan-500/30 hover:border-cyan-500/50';
    if (glow) glowClass = 'cyber-glow-cyan';
  } else if (variant === 'emerald') {
    borderClass = 'border-emerald-500/30 hover:border-emerald-500/50';
    if (glow) glowClass = 'cyber-glow-emerald';
  } else if (variant === 'amber') {
    borderClass = 'border-amber-500/30 hover:border-amber-500/50';
    if (glow) glowClass = 'cyber-glow-amber';
  } else if (variant === 'rose') {
    borderClass = 'border-rose-500/30 hover:border-rose-500/50';
    if (glow) glowClass = 'cyber-glow-rose';
  } else if (variant === 'purple') {
    borderClass = 'border-purple-500/30 hover:border-purple-500/50';
    if (glow) glowClass = 'shadow-lg shadow-purple-950/40';
  }

  return (
    <div
      className={`cyber-card rounded-xl p-5 border transition-all duration-200 ${borderClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
