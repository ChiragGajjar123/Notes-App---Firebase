'use client';

import React, { use, useEffect, useState } from 'react';
import { getPublicNote } from '@/lib/firebase/firestore';
import { Note } from '@/types/note';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Calendar, Tag, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatDate';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Public shared note reader view.
 * Enables anonymous read-only access for shared note URLs.
 */
export default function SharePage({ params }: SharePageProps) {
  const { id } = use(params);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicNote = async () => {
      try {
        const publicNote = await getPublicNote(id);
        setNote(publicNote);
      } catch (err) {
        console.error('Error fetching public shared note:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPublicNote();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="animate-spin h-9 w-9 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="max-w-md w-full text-center space-y-6 glass-panel p-8 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-800/40">
          <div className="mx-auto h-16 w-16 bg-rose-500/10 dark:bg-rose-950/20 flex items-center justify-center rounded-full text-rose-500">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-extrabold tracking-tight">Note Unshared or Not Found</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              This note may have been set to private, deleted by its owner, or the share link is invalid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-16 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xl rounded-3xl overflow-hidden">
        {/* Theme Accent Banner */}
        <div className="h-3 w-full" style={{ backgroundColor: note.color || '#8b5cf6' }} />
        
        <div className="p-8 md:p-12 space-y-6 text-left">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="primary" className="gap-1.5 py-1 px-3.5">
              <Sparkles size={11} className="animate-pulse" />
              Shared Note
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
              <Calendar size={13} />
              <span>{formatDate(note.updatedAt)}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {note.title}
          </h1>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <hr className="border-slate-100 dark:border-slate-800/50" />

          {/* Styled Rich Text Reader markup */}
          <div 
            className="prose prose-slate dark:prose-invert max-w-none leading-relaxed text-slate-800 dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
      </div>
    </div>
  );
}
