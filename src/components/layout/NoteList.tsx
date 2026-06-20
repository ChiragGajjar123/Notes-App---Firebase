'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NoteCard } from '../notes/NoteCard';
import { Note } from '@/types/note';
import { FileText } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
}

/**
 * Animated notes List.
 * Displays notes using a single-column layout centered for optimal text scanning.
 */
export function NoteList({ notes }: NoteListProps) {
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
      className="flex flex-col gap-4 max-w-4xl mx-auto w-full"
    >
      {notes.map((note) => (
        <motion.div key={note.id} variants={cardVariants} className="w-full">
          <NoteCard note={note} />
        </motion.div>
      ))}
    </motion.div>
  );
}
