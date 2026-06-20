'use client';

import React, { useState, useEffect } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { NoteGrid } from '@/components/layout/NoteGrid';
import { NoteList } from '@/components/layout/NoteList';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  Folder, 
  Tag, 
  Star, 
  Trash2, 
  Plus, 
  X,
  Keyboard,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Notes Dashboard Page.
 * Renders filtered Note grids/lists, sets filter banners, and listens for global keyboard shortcuts.
 */
export default function NotesPage() {
  const { 
    notes, 
    folders, 
    activeFolderId, 
    setActiveFolderId, 
    selectedTag, 
    setSelectedTag, 
    viewMode,
    addNote
  } = useNotes();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Active folder details
  const activeFolder = React.useMemo(() => {
    if (!activeFolderId || activeFolderId === 'favorites' || activeFolderId === 'trash') return null;
    return folders.find(f => f.id === activeFolderId) || null;
  }, [activeFolderId, folders]);

  const handleAddNewNote = async () => {
    await addNote({
      title: 'New Note',
      content: '<p></p>',
      plainText: '',
      color: '#fbfbfb',
      tags: [],
    });
  };

  // Keyboard listener: Ctrl+N (New Note) and ? (Help Modal)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ignore shortcut keys if user is typing inside text editor canvas or text fields
      const activeEl = document.activeElement;
      if (
        activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.hasAttribute('contenteditable') ||
          activeEl.classList.contains('ProseMirror')
        )
      ) {
        return;
      }

      // Ctrl + N
      if (e.key.toLowerCase() === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleAddNewNote();
      }

      // ? for shortcuts help modal
      if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [addNote]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner & Clear Filters Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1.5 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
              {activeFolderId === 'trash' ? 'Trash Bin' : activeFolderId === 'favorites' ? 'Favorites' : activeFolder ? activeFolder.name : 'All Notes'}
            </h2>
            
            {/* Folder indicator badge */}
            {activeFolder && (
              <Folder size={18} style={{ color: activeFolder.color }} className="ml-1" />
            )}
            {activeFolderId === 'favorites' && (
              <Star size={18} className="text-amber-500 fill-amber-500 ml-1" />
            )}
            {activeFolderId === 'trash' && (
              <Trash2 size={18} className="text-rose-500 ml-1" />
            )}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} matching filters
          </p>
        </div>

        {/* Filter tags clearance button */}
        {(activeFolderId || selectedTag) && (
          <button
            onClick={() => {
              setActiveFolderId(null);
              setSelectedTag(null);
            }}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 rounded-xl transition-all cursor-pointer shadow-2xs border border-transparent"
          >
            Clear Filters
            <X size={13} />
          </button>
        )}
      </div>

      {/* 2. Active filters display */}
      {selectedTag && (
        <div className="flex items-center gap-2 animate-fade-in text-left">
          <span className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider pl-1">
            Active Filter:
          </span>
          <Badge variant="primary" className="gap-1">
            <Tag size={10} />
            {selectedTag}
            <button 
              onClick={() => setSelectedTag(null)}
              className="hover:text-brand-900 rounded-full cursor-pointer ml-1"
            >
              <X size={10} />
            </button>
          </Badge>
        </div>
      )}

      {/* 3. Primary Grid / List viewport */}
      <div className="pt-2">
        {viewMode === 'grid' ? (
          <NoteGrid notes={notes} />
        ) : (
          <NoteList notes={notes} />
        )}
      </div>

      {/* Keyboard guide floating trigger */}
      <div className="fixed bottom-6 right-6 hidden md:block">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-4 py-2.5 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-md cursor-pointer transition-all active:scale-95"
          title="Shortcut Guide (?)"
        >
          <Keyboard size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Shortcuts</span>
        </button>
      </div>

      {/* KEYBOARD SHORTCUTS DIALOG */}
      <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Keyboard Shortcuts">
        <div className="space-y-4 text-sm text-left">
          <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100 dark:border-slate-850">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Action</span>
            <span className="font-semibold text-slate-500 dark:text-slate-400 text-right">Shortcut</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Create New Note</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold">Ctrl + N</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Save Note (Force-Save)</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold">Ctrl + S</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Focus Note Search</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Toggle Sidebar Menu</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold">Ctrl + /</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Display Help Modal</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold">?</kbd>
            </div>
          </div>
          
          <div className="flex justify-end pt-3">
            <Button onClick={() => setIsHelpOpen(false)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
