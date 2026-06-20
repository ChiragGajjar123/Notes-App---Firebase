'use client';

import React, { useRef, useEffect } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Badge } from '../ui/Badge';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Menu, 
  ArrowUpDown,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  onOpenMenu: () => void;
}

/**
 * Universal Dashboard Header.
 * Connects global search with keyboard hooks (Ctrl+K), grid/list togglers,
 * sort configurations, and network connectivity indicators.
 */
export function Header({ onOpenMenu }: HeaderProps) {
  const { 
    searchQuery, 
    setSearchQuery, 
    viewMode, 
    toggleViewMode, 
    sortOption, 
    setSortOption, 
    isOnline 
  } = useNotes();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hook Ctrl+K to focus search input
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <header className="glass-panel sticky top-0 z-30 flex items-center justify-between w-full px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/40">
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
        {/* Mobile menu trigger */}
        <button
          id="btn-header-menu-mobile"
          onClick={onOpenMenu}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 rounded-xl md:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        {/* Search input with Ctrl+K helper */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search size={16} />
          </div>
          <input
            id="notes-search-input"
            ref={searchInputRef}
            type="text"
            className="w-full pl-9 pr-12 py-2 text-sm bg-slate-100 dark:bg-slate-800/60 border-2 border-transparent focus:border-brand-500/20 dark:focus:border-brand-500/30 rounded-xl outline-none text-slate-850 dark:text-white transition-all placeholder-slate-400 dark:placeholder-slate-550"
            placeholder="Search notes, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded shadow-2xs">
                Ctrl K
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Sort options, layout controls, and online badge */}
      <div className="flex items-center gap-3">
        {/* Connectivity badge */}
        <div className="flex items-center">
          {isOnline ? (
            <Badge variant="success" className="gap-1 shadow-sm shadow-emerald-500/5">
              <Wifi size={10} className="text-emerald-500 animate-pulse" />
              <span className="hidden xs:inline">Online</span>
            </Badge>
          ) : (
            <Badge variant="danger" className="gap-1 shadow-sm shadow-red-500/5">
              <WifiOff size={10} className="text-red-500" />
              <span className="hidden xs:inline">Offline</span>
            </Badge>
          )}
        </div>

        {/* Sort Select */}
        <div className="relative flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-650 dark:text-slate-350 border border-transparent">
          <ArrowUpDown size={14} className="text-slate-450" />
          <select
            id="notes-sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-transparent border-none outline-none font-bold text-slate-700 dark:text-slate-300 pr-1 cursor-pointer"
            title="Sort results by"
          >
            <option value="updatedAt">Modified</option>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
            <option value="wordCount">Words</option>
          </select>
        </div>

        {/* Grid/List toggles */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-0.5 border border-transparent">
          <button
            id="btn-view-grid"
            onClick={toggleViewMode}
            className={cn(
              "p-1.5 rounded-lg transition-all cursor-pointer",
              viewMode === 'grid'
                ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            )}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          
          <button
            id="btn-view-list"
            onClick={toggleViewMode}
            className={cn(
              "p-1.5 rounded-lg transition-all cursor-pointer",
              viewMode === 'list'
                ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            )}
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
