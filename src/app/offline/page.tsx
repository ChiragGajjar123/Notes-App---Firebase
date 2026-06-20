'use client';

import React from 'react';
import { WifiOff, RotateCw } from 'lucide-react';

/**
 * Premium PWA Offline Fallback View.
 * Renders when network is down and requests fall outside pre-cached scopes.
 */
export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-md w-full text-center space-y-6 glass-panel p-8 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-800/40">
        <div className="mx-auto h-20 w-20 bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center rounded-full text-brand-500 dark:text-brand-400 animate-pulse">
          <WifiOff size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold tracking-tight">You're Offline</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            It looks like your internet connection is down. Aether Notes operates fully offline and will sync edits once your connection is restored, but this specific page hasn't been cached.
          </p>
        </div>
        
        <div className="pt-2">
          <button
            onClick={handleRetry}
            id="btn-retry-offline"
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
          >
            <RotateCw size={18} className="animate-spin-slow" />
            Check Connection
          </button>
        </div>
      </div>
    </div>
  );
}
