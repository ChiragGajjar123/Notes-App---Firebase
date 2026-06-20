import { useNotesContext } from '@/context/NotesContext';

/**
 * Custom hook to interface with Notes Context.
 */
export function useNotes() {
  return useNotesContext();
}
