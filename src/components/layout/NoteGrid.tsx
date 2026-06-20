'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NoteCard } from '../notes/NoteCard';
import { Note } from '@/types/note';
import { FileText } from 'lucide-react';

interface NoteGridProps {
  notes: Note[];
}

/**
 * Animated notes Grid.
 * Displays notes using a multi-column layout with Framer Motion stagger animations.
 */
export function NoteGrid({ notes }: NoteGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center">
          <FileText size={26} />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-bold text-lg text-slate-800 dark:text-slate-200">
            No notes found
          </h4>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
            Create a note to start capturing your ideas or adjust your current filters.
          </p>
        </div>
      </div>
    );
  }

  // Animation schema
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {notes.map((note) => (
        <motion.div key={note.id} variants={cardVariants}>
          <NoteCard note={note} />
        </motion.div>
      ))}
    </motion.div>
  );
}
