'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Note } from '@/types/note';
import { Folder } from '@/types/folder';
import { useAuthContext } from './AuthContext';
import { 
  subscribeToNotes, 
  subscribeToFolders, 
  createNote as dbCreateNote,
  updateNote as dbUpdateNote,
  softDeleteNote as dbSoftDelete,
  restoreNote as dbRestore,
  permanentlyDeleteNote as dbPermDelete,
  createFolder as dbCreateFolder,
  updateFolder as dbUpdateFolder,
  deleteFolder as dbDeleteFolder
} from '@/lib/firebase/firestore';

export type SortOption = 'updatedAt' | 'createdAt' | 'title' | 'wordCount';

interface NotesContextType {
  notes: Note[];
  folders: Folder[];
  activeNote: Note | null;
  setActiveNoteId: (id: string | null) => void;
  activeFolderId: string | null; // null represents "All Notes", 'favorites' for stars, 'trash' for trash bin
  setActiveFolderId: (id: string | null) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  viewMode: 'grid' | 'list';
  toggleViewMode: () => void;
  isOnline: boolean;
  
  // Note CRUD wrappers
  addNote: (data: Partial<Note>) => Promise<string | null>;
  editNote: (id: string, data: Partial<Note>) => Promise<void>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  
  // Folder CRUD wrappers
  addFolder: (name: string, color: string) => Promise<string | null>;
  editFolder: (id: string, name: string, color: string) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  
  // Dynamically generated content tags
  allTags: string[];
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const [rawNotes, setRawNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('updatedAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isOnline, setIsOnline] = useState(true);

  // Synchronize connectivity status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);
    
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Retrieve persistent settings
  useEffect(() => {
    const savedView = localStorage.getItem('notes_view_mode') as 'grid' | 'list' | null;
    if (savedView) setViewMode(savedView);
    
    const savedSort = localStorage.getItem('notes_sort_option') as SortOption | null;
    if (savedSort) setSortOption(savedSort);
  }, []);

  // Subscribe to Firebase snapshot updates
  useEffect(() => {
    if (!user) {
      setRawNotes([]);
      setFolders([]);
      setActiveNoteId(null);
      return;
    }

    const unsubNotes = subscribeToNotes(user.uid, (notesList) => {
      setRawNotes(notesList);
    });

    const unsubFolders = subscribeToFolders(user.uid, (foldersList) => {
      setFolders(foldersList);
    });

    return () => {
      unsubNotes();
      unsubFolders();
    };
  }, [user]);

  // Expose currently focused active note
  const activeNote = useMemo(() => {
    if (!activeNoteId) return null;
    return rawNotes.find((n) => n.id === activeNoteId) || null;
  }, [activeNoteId, rawNotes]);

  // Aggregate tag list dynamically from current active notes (excluding trashed notes)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    rawNotes.forEach((note) => {
      if (!note.isDeleted && note.tags) {
        note.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [rawNotes]);

  // Clean views filter + search
  const notes = useMemo(() => {
    let filtered = [...rawNotes];

    // 1. Filter by Folder / Special views
    if (activeFolderId === 'trash') {
      filtered = filtered.filter((n) => n.isDeleted);
    } else {
      filtered = filtered.filter((n) => !n.isDeleted);
      if (activeFolderId === 'favorites') {
        filtered = filtered.filter((n) => n.isFavorite);
      } else if (activeFolderId !== null) {
        filtered = filtered.filter((n) => n.folderId === activeFolderId);
      }
    }

    // 2. Filter by selected Tag
    if (selectedTag) {
      filtered = filtered.filter((n) => n.tags && n.tags.includes(selectedTag));
    }

    // 3. Search query filter (client-side text indexing)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.plainText.toLowerCase().includes(q) ||
          (n.tags && n.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    // 4. Sort results
    filtered.sort((a, b) => {
      // Pinned notes are forced to appear first in standard active list (not in trash)
      if (activeFolderId !== 'trash') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === 'wordCount') {
        return b.wordCount - a.wordCount;
      }
      
      const valA = a[sortOption] as any;
      const valB = b[sortOption] as any;
      const timeA = valA?.toMillis ? valA.toMillis() : 0;
      const timeB = valB?.toMillis ? valB.toMillis() : 0;
      return timeB - timeA;
    });

    return filtered;
  }, [rawNotes, activeFolderId, selectedTag, searchQuery, sortOption]);

  const toggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'grid' ? 'list' : 'grid';
      localStorage.setItem('notes_view_mode', next);
      return next;
    });
  };

  const handleSetSortOption = (option: SortOption) => {
    setSortOption(option);
    localStorage.setItem('notes_sort_option', option);
  };

  // Note actions
  const addNote = async (data: Partial<Note>) => {
    if (!user) return null;
    const noteId = await dbCreateNote(user.uid, {
      ...data,
      folderId: activeFolderId && activeFolderId !== 'trash' && activeFolderId !== 'favorites' ? activeFolderId : null
    });
    setActiveNoteId(noteId);
    return noteId;
  };

  const editNote = async (id: string, data: Partial<Note>) => {
    await dbUpdateNote(id, data);
  };

  const trashNote = async (id: string) => {
    await dbSoftDelete(id);
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const restoreNote = async (id: string) => {
    await dbRestore(id);
  };

  const deleteNotePermanently = async (id: string) => {
    await dbPermDelete(id);
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  // Folder actions
  const addFolder = async (name: string, color: string) => {
    if (!user) return null;
    return await dbCreateFolder(user.uid, name, color);
  };

  const editFolder = async (id: string, name: string, color: string) => {
    await dbUpdateFolder(id, name, color);
  };

  const removeFolder = async (id: string) => {
    await dbDeleteFolder(id);
    if (activeFolderId === id) {
      setActiveFolderId(null);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        activeNote,
        setActiveNoteId,
        activeFolderId,
        setActiveFolderId,
        selectedTag,
        setSelectedTag,
        searchQuery,
        setSearchQuery,
        sortOption,
        setSortOption: handleSetSortOption,
        viewMode,
        toggleViewMode,
        isOnline,
        addNote,
        editNote,
        trashNote,
        restoreNote,
        deleteNotePermanently,
        addFolder,
        editFolder,
        removeFolder,
        allTags,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotesContext must be wrapped in NotesProvider');
  return context;
};
