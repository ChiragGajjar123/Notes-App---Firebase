'use client';

import React, { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNotes } from '@/hooks/useNotes';
import { NoteActions } from '@/components/notes/NoteActions';
import { NoteEditor } from '@/components/editor/NoteEditor';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Note Editor workspace page.
 * Houses title auto-saves, soft-delete alerts, and wraps NoteActions and NoteEditor.
 */
export default function NoteDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { rawNotes, editNote, restoreNote, deleteNotePermanently } = useNotes();
  
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestTitleRef = useRef(title);

  // Keep latestTitleRef updated with the current title state
  useEffect(() => {
    latestTitleRef.current = title;
  }, [title]);

  const activeNote = React.useMemo(() => {
    return rawNotes.find(n => n.id === id) || null;
  }, [rawNotes, id]);

  // Synchronize title state when note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      latestTitleRef.current = activeNote.title;
    }
  }, [activeNote?.id]);

  // Flush title saves instantly on swap/unmount
  const flushTitleSaveInstant = () => {
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
      titleSaveTimeoutRef.current = null;
    }
    
    if (activeNote && latestTitleRef.current !== activeNote.title) {
      editNote(activeNote.id, { title: latestTitleRef.current.trim() || 'Untitled Note' });
    }
  };

  useEffect(() => {
    return () => {
      flushTitleSaveInstant();
    };
  }, [activeNote?.id]);

  if (!activeNote) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center">
          <AlertTriangle size={28} />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-bold text-lg text-slate-800 dark:text-slate-200">Note not found</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This note might have been deleted permanently or does not belong to you.
          </p>
        </div>
        <Button onClick={() => router.push('/notes')} className="mt-2">
          Back to Workspace
        </Button>
      </div>
    );
  }

  // Handle title modifications with 500ms auto-save debounce
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSaveStatus('saving');

    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }

    titleSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await editNote(activeNote.id, { title: newTitle.trim() || 'Untitled Note' });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to autosave title:', err);
        setSaveStatus('saved'); // or handle offline/error, but don't leave it stuck in saving
      }
    }, 500);
  };

  const handleEditorSave = async (content: string, plainText: string, wordCount: number) => {
    await editNote(activeNote.id, { content, plainText, wordCount });
  };

  const handleRestore = async () => {
    if (!activeNote || isRestoring) return;
    setIsRestoring(true);
    try {
      await restoreNote(activeNote.id);
    } catch (err) {
      console.error('Failed to restore note:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!activeNote || isDeleting) return;
    if (confirm("Are you sure you want to permanently delete this note? This action is irreversible.")) {
      setIsDeleting(true);
      try {
        await deleteNotePermanently(activeNote.id);
        router.push('/notes');
      } catch (err) {
        console.error('Failed to permanently delete note:', err);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-full text-left">
      {/* Top controls banner */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { flushTitleSaveInstant(); router.push('/notes'); }}
          className="rounded-xl flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        
        <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider pl-1">
          Editing Note
        </span>
      </div>

      {/* Trash Bin lock banner */}
      {activeNote.isDeleted && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-350 p-4 rounded-2xl text-sm font-semibold shadow-inner">
          <div className="flex items-center gap-2">
            <Trash2 size={18} className="text-rose-500 flex-shrink-0" />
            <span>This note resides in Trash. Restoring enables edits.</span>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleRestore} 
              isLoading={isRestoring} 
              disabled={isDeleting}
              className="text-emerald-600 dark:text-emerald-400"
            >
              <RotateCcw size={14} className="mr-1.5" />
              Restore
            </Button>
            <Button 
              size="sm" 
              variant="danger" 
              onClick={handlePermanentDelete} 
              isLoading={isDeleting} 
              disabled={isRestoring}
            >
              <Trash2 size={14} className="mr-1.5" />
              Hard Delete
            </Button>
          </div>
        </div>
      )}

      {/* Editor top Action Toolbar */}
      <NoteActions note={activeNote} />

      {/* Title Text Area */}
      <div className="relative group text-left">
        <input
          id="note-workspace-title-input"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Note"
          disabled={activeNote.isDeleted}
          className="w-full bg-transparent border-none text-3xl md:text-4xl font-display font-extrabold tracking-tight outline-none focus:ring-0 text-slate-850 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 py-1"
        />
        {saveStatus === 'saving' && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Autosaving...
          </span>
        )}
      </div>

      {/* Rich Editor canvas (disabled if note is soft-deleted) */}
      <div className={cn("flex-1", activeNote.isDeleted && "opacity-60 pointer-events-none")}>
        <NoteEditor note={activeNote} onSave={handleEditorSave} />
      </div>
    </div>
  );
}
