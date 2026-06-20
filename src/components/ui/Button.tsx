import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

/**
 * Reusable premium button component.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-display font-semibold transition-all select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer border border-transparent",
          // Style Variants
          variant === 'primary' && "bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/10 hover:shadow-lg active:bg-brand-700",
          variant === 'secondary' && "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-200 dark:active:bg-slate-800",
          variant === 'danger' && "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/10 hover:shadow-lg active:bg-red-700",
          variant === 'outline' && "border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800/80 dark:hover:bg-slate-900/60 dark:text-slate-300",
          variant === 'ghost' && "hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-900/60 dark:text-slate-300",
          // Sizing Options
          size === 'sm' && "px-3.5 py-1.5 text-xs rounded-xl",
          size === 'md' && "px-4.5 py-2.5 text-sm rounded-2xl",
          size === 'lg' && "px-6 py-3.5 text-base rounded-[20px]",
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
