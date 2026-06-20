'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNotes } from '@/hooks/useNotes';
import { useSearch } from '@/hooks/useSearch';
import { formatDateShort } from '@/lib/utils/formatDate';
import { Note } from '@/types/note';
import { Badge } from '../ui/Badge';
import { 
  Pin, 
  Star, 
  Tag, 
  Trash2,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NoteCardProps {
  note: Note;
}

/**
 * Premium Note summary card.
 * Integrates search highlighting, pin/star states, custom color palettes, and redirects.
 */
export function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();
  const { setActiveNoteId, activeFolderId, restoreNote, deleteNotePermanently } = useNotes();
  const { highlightText } = useSearch();
  const { searchQuery } = useNotes();

  const handleCardClick = () => {
    setActiveNoteId(note.id);
    router.push(`/notes/${note.id}`);
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await restoreNote(note.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note permanently? This action cannot be undone.")) {
      await deleteNotePermanently(note.id);
    }
  };

  // Convert raw background color into a softer tinted background for light/dark modes
  const cardStyle = React.useMemo(() => {
    const rawColor = note.color || '#fbfbfb';
    return {
      lightBg: rawColor === '#fbfbfb' ? 'bg-white' : '',
      customStyle: rawColor !== '#fbfbfb' ? {
        '--note-color': rawColor,
      } as React.CSSProperties : {}
    };
  }, [note.color]);

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "glass-card group flex flex-col justify-between p-5 rounded-2xl h-48 cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-98",
        cardStyle.lightBg
      )}
      style={{
        borderLeft: `5px solid ${note.color || '#e2e8f0'}`,
        ...cardStyle.customStyle
      }}
    >
      {/* Tinted Background Overlay */}
      {note.color && note.color !== '#fbfbfb' && (
        <div 
          className="absolute inset-0 opacity-10 dark:opacity-15 pointer-events-none transition-colors"
          style={{ backgroundColor: note.color }}
        />
      )}

      {/* Top Banner (Title & Status) */}
      <div className="space-y-1.5 relative z-10 text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base text-slate-850 dark:text-white line-clamp-1 leading-snug">
            {highlightText(note.title || 'Untitled Note', searchQuery)}
          </h3>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {note.isPinned && !note.isDeleted && (
              <Pin size={13} className="text-brand-500 fill-brand-500" />
            )}
            {note.isFavorite && !note.isDeleted && (
              <Star size={13} className="text-amber-500 fill-amber-500" />
            )}
          </div>
        </div>

        {/* Text Body Snippet */}
        <p className="text-xs text-slate-450 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {note.plainText 
            ? highlightText(note.plainText, searchQuery)
            : <span className="italic text-slate-350 dark:text-slate-500">No content inside</span>
          }
        </p>
      </div>

      {/* Bottom Panel (Meta stats, Tags & Trash actions) */}
      <div className="relative z-10 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
        {/* Dynamic Tag badging */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-6 overflow-hidden">
            {note.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <Tag size={8} />
                {tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold self-center">
                +{note.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <Clock size={10} />
            <span>{formatDateShort(note.updatedAt)}</span>
          </div>

          {/* Action overlays inside trash */}
          {note.isDeleted ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRestore}
                className="px-2 py-1 text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-lg cursor-pointer transition-colors"
                title="Restore note"
              >
                Restore
              </button>
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                title="Delete note permanently"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
              {note.wordCount} words
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
