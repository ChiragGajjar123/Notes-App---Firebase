import React from 'react';

export default function NotesLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-2 text-left">
          <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-32 bg-slate-150 dark:bg-slate-850 rounded-lg" />
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 h-48 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-850 rounded-md" />
              <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-850 rounded-md" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-4.5 w-20 bg-slate-100 dark:bg-slate-850 rounded-md" />
              <div className="h-4.5 w-16 bg-slate-100 dark:bg-slate-850 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
