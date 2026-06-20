import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

/**
 * Reusable premium badge label component.
 */
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide transition-colors select-none border border-transparent",
        // Variations
        variant === 'default' && "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300",
        variant === 'primary' && "bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-950/25 dark:text-brand-300 dark:border-brand-900/35",
        variant === 'success' && "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30",
        variant === 'warning' && "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30",
        variant === 'danger' && "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30",
        className
      )}
    >
      {children}
    </span>
  );
}
