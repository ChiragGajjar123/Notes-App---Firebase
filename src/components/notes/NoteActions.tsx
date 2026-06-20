'use client';

import React, { useState } from 'react';
import { Note } from '@/types/note';
import { Folder } from '@/types/folder';
import { useNotes } from '@/hooks/useNotes';
import { Tooltip } from '../ui/Tooltip';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  exportAsMarkdown, 
  exportAsPlainText, 
  exportAsPDF 
} from '@/lib/utils/exportNote';
import { 
  Pin, 
  Star, 
  FolderOpen, 
  Palette, 
  Tag, 
  Share2, 
  Download, 
  Trash2,
  Undo,
  Copy,
  Check,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NoteActionsProps {
  note: Note;
}

/**
 * Note configurations action overlay.
 * Handles pins, stars, folder routes, tagging autocompletes, public links, and exports.
 */
export function NoteActions({ note }: NoteActionsProps) {
  const { 
    folders, 
    editNote, 
    trashNote, 
    restoreNote, 
    deleteNotePermanently,
    allTags
  } = useNotes();

  const [isCopied, setIsCopied] = useState(false);
  
  // Menu visibility toggles
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // New tag states
  const [newTag, setNewTag] = useState('');

  const colorsList = [
    { name: 'White', value: '#fbfbfb' },
    { name: 'Lavender', value: '#f5f3ff' },
    { name: 'Mint', value: '#ecfdf5' },
    { name: 'Sage', value: '#f0fdf4' },
    { name: 'Peach', value: '#fff7ed' },
    { name: 'Rose', value: '#fff1f2' },
    { name: 'Slate', value: '#f8fafc' },
    { name: 'Cream', value: '#fefce8' }
  ];

  const handleTogglePin = async () => {
    await editNote(note.id, { isPinned: !note.isPinned });
  };

  const handleToggleFavorite = async () => {
    await editNote(note.id, { isFavorite: !note.isFavorite });
  };

  const handleSetColor = async (colorValue: string) => {
    await editNote(note.id, { color: colorValue });
    setShowColorPicker(false);
  };

  const handleMoveFolder = async (folderId: string | null) => {
    await editNote(note.id, { folderId });
    setShowFolderSelector(false);
  };

  const handleAddTag = async (tagText: string) => {
    const sanitized = tagText.trim().toLowerCase();
    if (!sanitized) return;
    if (note.tags.includes(sanitized)) {
      setNewTag('');
      return;
    }
    const updatedTags = [...note.tags, sanitized];
    await editNote(note.id, { tags: updatedTags });
    setNewTag('');
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = note.tags.filter(t => t !== tagToRemove);
    await editNote(note.id, { tags: updatedTags });
  };

  const handleToggleShare = async () => {
    await editNote(note.id, { isPublic: !note.isPublic });
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/share/${note.id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Filter existing tags not currently present on this note
  const tagSuggestions = React.useMemo(() => {
    return allTags.filter(t => !note.tags.includes(t));
  }, [allTags, note.tags]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
      
      {/* 1. Star / Pin toggle section */}
      <div className="flex items-center gap-1">
        <Tooltip content={note.isPinned ? "Unpin note" : "Pin note to top"}>
          <button
            onClick={handleTogglePin}
            className={cn(
              "p-2 rounded-xl transition-colors cursor-pointer",
              note.isPinned 
                ? "bg-brand-50 text-brand-500 dark:bg-brand-950/20 dark:text-brand-400" 
                : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-700"
            )}
          >
            <Pin size={18} className={cn(note.isPinned && "fill-brand-500")} />
          </button>
        </Tooltip>

        <Tooltip content={note.isFavorite ? "Remove favorite" : "Mark as favorite"}>
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "p-2 rounded-xl transition-colors cursor-pointer",
              note.isFavorite 
                ? "bg-amber-50 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400" 
                : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-700"
            )}
          >
            <Star size={18} className={cn(note.isFavorite && "fill-amber-500")} />
          </button>
        </Tooltip>

        {/* Color picker triggers */}
        <div className="relative">
          <Tooltip content="Choose note color">
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowFolderSelector(false);
                setShowTagManager(false);
                setShowExportMenu(false);
              }}
              className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-700 rounded-xl cursor-pointer"
            >
              <Palette size={18} />
            </button>
          </Tooltip>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 shadow-xl rounded-2xl p-3 flex gap-2">
              {colorsList.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleSetColor(c.value)}
                  className={cn(
                    "h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 active:scale-95 transition-transform",
                    note.color === c.value && "ring-2 ring-brand-500"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Move Folder trigger */}
        <div className="relative">
          <Tooltip content="Move to Folder">
            <button
              onClick={() => {
                setShowFolderSelector(!showFolderSelector);
                setShowColorPicker(false);
                setShowTagManager(false);
                setShowExportMenu(false);
              }}
              className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-700 rounded-xl cursor-pointer"
            >
              <FolderOpen size={18} />
            </button>
          </Tooltip>

          {showFolderSelector && (
            <div className="absolute top-full left-0 mt-2 z-20 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 shadow-xl rounded-2xl p-2 space-y-1">
              <button
                onClick={() => handleMoveFolder(null)}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg cursor-pointer"
              >
                Unassigned (No Folder)
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleMoveFolder(f.id)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags trigger */}
        <div className="relative">
          <Tooltip content="Add or Edit Tags">
            <button
              onClick={() => {
                setShowTagManager(!showTagManager);
                setShowColorPicker(false);
                setShowFolderSelector(false);
                setShowExportMenu(false);
              }}
              className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-700 rounded-xl cursor-pointer"
            >
              <Tag size={18} />
            </button>
          </Tooltip>

          {showTagManager && (
            <div className="absolute top-full left-0 mt-2 z-20 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 shadow-xl rounded-2xl p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/25 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag(newTag);
                  }}
                />
                <Button size="sm" className="rounded-xl" onClick={() => handleAddTag(newTag)}>
                  <Plus size={14} />
                </Button>
              </div>

              {/* Suggestions dropdown list */}
              {tagSuggestions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Existing Tags</span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {tagSuggestions.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Tags lists */}
              <div className="space-y-1 border-t border-slate-100 dark:border-slate-700/50 pt-2 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active on Note</span>
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(tag => (
                    <Badge key={tag} className="gap-1 text-[10px]">
                      {tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 rounded-full cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </Badge>
                  ))}
                  {note.tags.length === 0 && (
                    <p className="text-[10px] italic text-slate-400 pl-1">No active tags</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Public sharing link & exports panel */}
      <div className="flex items-center gap-2">
        {/* Share togglers */}
        <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-2">
          <Tooltip content="Share Settings">
            <button
              onClick={handleToggleShare}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer border",
                note.isPublic 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 border-transparent"
              )}
            >
              <Share2 size={14} />
              <span>{note.isPublic ? 'Public Link Active' : 'Private'}</span>
            </button>
          </Tooltip>

          {note.isPublic && (
            <button
              onClick={handleCopyLink}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 hover:text-brand-500 rounded-xl transition-colors cursor-pointer"
              title="Copy shareable link"
            >
              {isCopied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          )}
        </div>

        {/* Note Downloader / Exports */}
        <div className="relative">
          <Tooltip content="Export Note">
            <button
              onClick={() => {
                setShowExportMenu(!showExportMenu);
                setShowColorPicker(false);
                setShowFolderSelector(false);
                setShowTagManager(false);
              }}
              className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 rounded-xl cursor-pointer"
            >
              <Download size={18} />
            </button>
          </Tooltip>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-2 z-20 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 shadow-xl rounded-2xl p-2 space-y-1">
              <button
                onClick={() => { exportAsMarkdown(note.title, note.content); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg cursor-pointer"
              >
                Markdown (.md)
              </button>
              <button
                onClick={() => { exportAsPlainText(note.title, note.content); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg cursor-pointer"
              >
                Plain Text (.txt)
              </button>
              <button
                onClick={() => { exportAsPDF(note.title, note.content); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg cursor-pointer"
              >
                PDF Document (.pdf)
              </button>
            </div>
          )}
        </div>

        {/* Soft-Delete / Restore toggle */}
        {note.isDeleted ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => restoreNote(note.id)}
            className="gap-1.5 cursor-pointer"
          >
            <Undo size={14} />
            Restore
          </Button>
        ) : (
          <button
            onClick={() => trashNote(note.id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
            title="Move note to trash"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
