import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';
  
  const variantStyles = {
    cyan: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/30',
    emerald: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-950/70 text-rose-300 border-rose-500/30',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border font-mono ${sizeClasses} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
