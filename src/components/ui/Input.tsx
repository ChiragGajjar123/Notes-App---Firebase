import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

/**
 * Reusable premium input component.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, type = 'text', id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            type={type}
            ref={ref}
            className={cn(
              "w-full px-4 py-3 text-sm bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900/50",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 pl-1 font-medium animate-pulse">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
