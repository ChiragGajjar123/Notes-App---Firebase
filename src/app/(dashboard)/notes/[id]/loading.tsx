import React from 'react';

export default function NoteDetailLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-full text-left animate-pulse">
      {/* Top Controls Banner Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-4 w-28 bg-slate-150 dark:bg-slate-850 rounded-lg" />
      </div>

      {/* Note Action Toolbar Skeleton */}
      <div className="h-14 w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl" />

      {/* Note Title Input Skeleton */}
      <div className="h-12 w-3/4 bg-slate-150 dark:bg-slate-850 rounded-xl" />

      {/* Rich Editor Canvas Skeleton */}
      <div className="flex-1 min-h-[400px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="h-4.5 w-1/3 bg-slate-250 dark:bg-slate-800 rounded-lg mb-6" />
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-850 rounded-md" />
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-850 rounded-md" />
        <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-850 rounded-md" />
        <div className="h-4 w-4/5 bg-slate-100 dark:bg-slate-850 rounded-md" />
      </div>
    </div>
  );
}
