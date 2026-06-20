'use client';

import React from 'react';
import { Editor, BubbleMenu } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare,
  Quote, 
  Code, 
  Undo, 
  Redo, 
  Link as LinkIcon, 
  Unlink,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ToolbarProps {
  editor: Editor | null;
}

/**
 * Rich Text Editing Toolbar and Bubble Menu controller.
 */
export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Hyperlink URL:', previousUrl);
    
    if (url === null) return; // Cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <>
      {/* 1. FLOATING BUBBLE MENU */}
      <BubbleMenu 
        editor={editor} 
        tippyOptions={{ duration: 100 }} 
        className="flex items-center gap-1 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-xl p-1 border border-slate-700/30"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("bubble-menu-btn text-white! hover:bg-slate-800 dark:hover:bg-slate-700", editor.isActive('bold') && "bg-brand-500 hover:bg-brand-500")}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("bubble-menu-btn text-white! hover:bg-slate-800 dark:hover:bg-slate-700", editor.isActive('italic') && "bg-brand-500 hover:bg-brand-500")}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn("bubble-menu-btn text-white! hover:bg-slate-800 dark:hover:bg-slate-700", editor.isActive('strike') && "bg-brand-500 hover:bg-brand-500")}
          title="Strike-through"
        >
          <Strikethrough size={14} />
        </button>
        
        <span className="w-px h-4 bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={cn("bubble-menu-btn text-white! hover:bg-slate-800 dark:hover:bg-slate-700", editor.isActive('link') && "bg-brand-500 hover:bg-brand-500")}
          title="Insert Link"
        >
          <LinkIcon size={14} />
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="bubble-menu-btn text-white! hover:bg-slate-800 dark:hover:bg-slate-700"
            title="Remove Link"
          >
            <Unlink size={14} />
          </button>
        )}
      </BubbleMenu>

      {/* 2. FIXED EDITOR TOP TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-slate-50/60 dark:bg-slate-800/20 border-b border-slate-200/80 dark:border-slate-800/40 rounded-t-2xl">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn("bubble-menu-btn", editor.isActive('heading', { level: 1 }) && "is-active")}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("bubble-menu-btn", editor.isActive('heading', { level: 2 }) && "is-active")}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("bubble-menu-btn", editor.isActive('heading', { level: 3 }) && "is-active")}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Lists & Checkboxes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("bubble-menu-btn", editor.isActive('bulletList') && "is-active")}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("bubble-menu-btn", editor.isActive('orderedList') && "is-active")}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn("bubble-menu-btn", editor.isActive('taskList') && "is-active")}
          title="Checklist"
        >
          <CheckSquare size={16} />
        </button>

        <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Quotation, Rules & Code Blocks */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("bubble-menu-btn", editor.isActive('blockquote') && "is-active")}
          title="Blockquote"
        >
          <Quote size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn("bubble-menu-btn", editor.isActive('codeBlock') && "is-active")}
          title="Code Block"
        >
          <Code size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="bubble-menu-btn"
          title="Horizontal Rule Divider"
        >
          <Minus size={16} />
        </button>

        <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Links */}
        <button
          type="button"
          onClick={setLink}
          className={cn("bubble-menu-btn", editor.isActive('link') && "is-active")}
          title="Link text"
        >
          <LinkIcon size={16} />
        </button>

        <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="bubble-menu-btn disabled:opacity-30 disabled:pointer-events-none"
          title="Undo last change"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="bubble-menu-btn disabled:opacity-30 disabled:pointer-events-none"
          title="Redo change"
        >
          <Redo size={16} />
        </button>
      </div>
    </>
  );
}
