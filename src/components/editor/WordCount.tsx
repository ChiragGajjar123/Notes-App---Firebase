import React from 'react';
import { Editor } from '@tiptap/react';

interface WordCountProps {
  editor: Editor | null;
}

/**
 * Word and Character metrics component.
 * Grabs statistics directly from the characterCount Tiptap storage extension.
 */
export function WordCount({ editor }: WordCountProps) {
  if (!editor) return null;

  const characters = editor.storage.characterCount.characters();
  const words = editor.storage.characterCount.words();

  return (
    <div className="flex items-center gap-3.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
      <span>{words} {words === 1 ? 'Word' : 'Words'}</span>
      <span className="h-3 w-px bg-slate-250 dark:bg-slate-800" />
      <span>{characters} {characters === 1 ? 'Character' : 'Characters'}</span>
    </div>
  );
}
