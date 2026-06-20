'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import { common, createLowlight } from 'lowlight';

import { useAuth } from '@/hooks/useAuth';
import { uploadImage } from '@/lib/firebase/storage';
import { Note } from '@/types/note';
import { Toolbar } from './Toolbar';
import { WordCount } from './WordCount';
import { 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  CloudLightning,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils/cn';

interface NoteEditorProps {
  note: Note;
  onSave: (content: string, plainText: string, wordCount: number) => Promise<void>;
}

const lowlight = createLowlight(common);

/**
 * Premium Note Editor.
 * Integrates Tiptap rich-text canvas, storage attachments, speech transcription,
 * and 500ms auto-saves.
 */
export function NoteEditor({ note, onSave }: NoteEditorProps) {
  const { user } = useAuth();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Capture latest references to perform instant saves during cleanup or unmounting
  const latestContentRef = useRef({
    content: note.content,
    plainText: note.plainText,
    wordCount: note.wordCount
  });

  // Setup browser Web Speech API transcription
  const SpeechRecognition = typeof window !== 'undefined' && (
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    try {
      setSaveStatus('saving');
      const downloadURL = await uploadImage(user.uid, file);
      editor?.chain().focus().setImage({ src: downloadURL, alt: file.name }).run();
      setSaveStatus('saved');
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try again.');
      setSaveStatus('saved');
    }
  };

  const triggerLocalImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        await handleImageUpload(input.files[0]);
      }
    };
    input.click();
  };

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disabled to use CodeBlockLowlight instead
      }),
      Placeholder.configure({
        placeholder: 'Start writing your premium note here...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-600 dark:text-brand-400 underline underline-offset-4 font-semibold cursor-pointer',
        },
      }),
      CharacterCount,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item-checkbox',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'note-embedded-image',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none p-6 min-h-[400px]',
      },
      // Drag & Drop Image reader implementation
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      const plainText = editor.getText();
      const wordCount = editor.storage.characterCount.words();

      // Track latest updates locally
      latestContentRef.current = { content, plainText, wordCount };
      
      setSaveStatus('saving');

      // Clear existing debounce timers
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Start 500ms auto-save timer
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await onSave(content, plainText, wordCount);
          setSaveStatus('saved');
        } catch (err) {
          console.error('Debounced save error:', err);
          setSaveStatus('offline');
        }
      }, 500);
    },
  });

  // Force-save any pending changes instantly
  const forceSaveInstant = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    const { content, plainText, wordCount } = latestContentRef.current;
    if (content !== note.content) {
      try {
        await onSave(content, plainText, wordCount);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Unmount instant save error:', err);
        setSaveStatus('offline');
      }
    }
  };

  // Synchronize editor content when note changes
  useEffect(() => {
    if (!editor || !note) return;
    
    // Save any outstanding modifications before swapping note canvases
    forceSaveInstant();

    // Reset editor canvas content if different
    if (editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content, false);
    }
    
    // Update local reference tracker
    latestContentRef.current = {
      content: note.content,
      plainText: note.plainText,
      wordCount: note.wordCount
    };
    
    setSaveStatus('saved');
  }, [note.id, editor]);

  // Flush any pending saves on unmounting
  useEffect(() => {
    return () => {
      forceSaveInstant();
    };
  }, []);

  // Web Speech API actions
  const toggleSpeech = () => {
    if (isTranscribing) {
      stopSpeech();
    } else {
      startSpeech();
    }
  };

  const startSpeech = () => {
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please try Google Chrome.');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        // Append at cursor position
        editor?.chain().focus().insertContent(transcript + ' ').run();
      };

      recognition.onerror = (e: any) => {
        console.error('Speech recognition error:', e.error);
        setIsTranscribing(false);
      };

      recognition.onend = () => {
        setIsTranscribing(false);
      };

      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
      setIsTranscribing(true);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsTranscribing(false);
    }
  };

  const stopSpeech = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsTranscribing(false);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Editor top toolbar controls */}
      <Toolbar editor={editor} />

      {/* Editor viewport */}
      <div className="flex-1 overflow-y-auto min-h-[400px] border-b border-slate-200/80 dark:border-slate-800">
        <EditorContent editor={editor} />
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/10">
        {/* Word/Character stats */}
        <WordCount editor={editor} />

        {/* Action Panel: Voice transcript, Image insert & Saving Status */}
        <div className="flex items-center gap-3">
          {/* Saving indicator */}
          <div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 mr-1 select-none">
            {saveStatus === 'saving' && (
              <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1">
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                <CloudLightning size={13} className="text-emerald-500" />
                Auto-saved
              </span>
            )}
            {saveStatus === 'offline' && (
              <span className="text-rose-500 flex items-center gap-1">
                Offline Cache
              </span>
            )}
          </div>

          {/* Inline Image insertion */}
          <button
            onClick={triggerLocalImageUpload}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all cursor-pointer hover:text-slate-800"
            title="Upload image"
          >
            <ImageIcon size={18} />
          </button>

          {/* Web Speech microphone toggle */}
          <button
            onClick={toggleSpeech}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border",
              isTranscribing
                ? "bg-rose-50 border-rose-250 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/40 animate-pulse"
                : "border-transparent text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-800"
            )}
            title={isTranscribing ? "Transcribing... click to stop" : "Speech-to-text voice typing"}
          >
            {isTranscribing ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
