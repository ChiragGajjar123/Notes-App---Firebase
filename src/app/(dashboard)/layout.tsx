'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

/**
 * Main dashboard layout.
 * Connects Sidebar navigation drawers and responsive page contents.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Primary content dashboard pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Universal Action Header */}
        <Header onOpenMenu={() => setSidebarOpen(true)} />

        {/* Dynamic page sub-views */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-150/40 dark:bg-slate-950/20">
          {children}
        </main>
      </div>
    </div>
  );
}
