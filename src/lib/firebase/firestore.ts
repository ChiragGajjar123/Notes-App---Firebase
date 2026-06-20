import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDoc,
  getDocs,
  writeBatch,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { Note } from '@/types/note';
import { Folder } from '@/types/folder';

// Collection Helper References
const notesCol = collection(db, 'notes');
const foldersCol = collection(db, 'folders');
const usersCol = collection(db, 'users');

/**
 * Fetch the saved theme preference for a user from Firestore.
 * Returns null if no preference has been saved yet.
 */
export const getUserThemePreference = async (userId: string): Promise<'light' | 'dark' | null> => {
  try {
    const userRef = doc(usersCol, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return data?.preferences?.theme ?? null;
    }
    return null;
  } catch (error) {
    console.error('Error reading user theme preference:', error);
    return null;
  }
};

/**
 * Persist the user's theme preference to Firestore at users/{uid}.preferences.theme.
 * Uses merge so that other user fields are not overwritten.
 */
export const saveUserThemePreference = async (userId: string, theme: 'light' | 'dark'): Promise<void> => {
  try {
    const userRef = doc(usersCol, userId);
    await setDoc(userRef, { preferences: { theme } }, { merge: true });
  } catch (error) {
    console.error('Error saving user theme preference:', error);
  }
};

/**
 * Increment or decrement noteCount for a folder
 */
export const updateFolderNoteCount = async (folderId: string | null, change: number) => {
  if (!folderId) return;
  const folderRef = doc(db, 'folders', folderId);
  try {
    await updateDoc(folderRef, {
      noteCount: increment(change)
    });
  } catch (error) {
    console.error("Error updating folder note count:", error);
  }
};

/**
 * Subscribes to all notes of a user (real-time)
 */
export const subscribeToNotes = (userId: string, callback: (notes: Note[]) => void) => {
  const q = query(
    notesCol,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notes: Note[] = [];
    snapshot.forEach((doc) => {
      notes.push(doc.data() as Note);
    });
    callback(notes);
  }, (error) => {
    console.error("Error subscribing to notes:", error);
  });
};

/**
 * Create a new note
 */
export const createNote = async (userId: string, data: Partial<Note>): Promise<string> => {
  const noteRef = doc(notesCol);
  const folderId = data.folderId || null;
  const noteColor = data.color || '#fbfbfb'; // Sleek default note color
  
  const note: Note = {
    id: noteRef.id,
    userId,
    title: data.title || 'Untitled Note',
    content: data.content || '',
    plainText: data.plainText || '',
    color: noteColor,
    folderId,
    tags: data.tags || [],
    isPinned: data.isPinned || false,
    isFavorite: data.isFavorite || false,
    isDeleted: false,
    deletedAt: null,
    wordCount: data.wordCount || 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isPublic: data.isPublic || false
  };

  await setDoc(noteRef, note);

  if (folderId) {
    await updateFolderNoteCount(folderId, 1);
  }

  return noteRef.id;
};

/**
 * Update an existing note
 */
export const updateNote = async (noteId: string, data: Partial<Note>): Promise<void> => {
  const noteRef = doc(db, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);
  if (!noteSnap.exists()) throw new Error("Note does not exist");
  const oldNote = noteSnap.data() as Note;

  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now()
  };

  await updateDoc(noteRef, updateData);

  // If folderId changed, adjust folder note counts
  if (data.folderId !== undefined && data.folderId !== oldNote.folderId) {
    // Only adjust counts if note isn't in Trash (isDeleted is false)
    if (!oldNote.isDeleted) {
      if (oldNote.folderId) {
        await updateFolderNoteCount(oldNote.folderId, -1);
      }
      if (data.folderId) {
        await updateFolderNoteCount(data.folderId, 1);
      }
    }
  }
};

/**
 * Soft delete a note (move to trash)
 */
export const softDeleteNote = async (noteId: string): Promise<void> => {
  const noteRef = doc(db, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);
  if (!noteSnap.exists()) return;
  const note = noteSnap.data() as Note;

  if (note.isDeleted) return;

  await updateDoc(noteRef, {
    isDeleted: true,
    deletedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  // Decrement folder count since it is now in trash
  if (note.folderId) {
    await updateFolderNoteCount(note.folderId, -1);
  }
};

/**
 * Restore note from trash
 */
export const restoreNote = async (noteId: string): Promise<void> => {
  const noteRef = doc(db, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);
  if (!noteSnap.exists()) return;
  const note = noteSnap.data() as Note;

  if (!note.isDeleted) return;

  await updateDoc(noteRef, {
    isDeleted: false,
    deletedAt: null,
    updatedAt: Timestamp.now()
  });

  // Re-increment folder count
  if (note.folderId) {
    await updateFolderNoteCount(note.folderId, 1);
  }
};

/**
 * Permanently delete a note
 */
export const permanentlyDeleteNote = async (noteId: string): Promise<void> => {
  const noteRef = doc(db, 'notes', noteId);
  await deleteDoc(noteRef);
};

/**
 * Get a shared note publicly
 */
export const getPublicNote = async (noteId: string): Promise<Note | null> => {
  const noteRef = doc(db, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);
  if (noteSnap.exists()) {
    const note = noteSnap.data() as Note;
    if (note.isPublic) {
      return note;
    }
  }
  return null;
};

/**
 * Subscribes to folders (real-time)
 */
export const subscribeToFolders = (userId: string, callback: (folders: Folder[]) => void) => {
  const q = query(
    foldersCol,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const folders: Folder[] = [];
    snapshot.forEach((doc) => {
      folders.push(doc.data() as Folder);
    });
    callback(folders);
  }, (error) => {
    console.error("Error subscribing to folders:", error);
  });
};

/**
 * Create folder
 */
export const createFolder = async (userId: string, name: string, color: string): Promise<string> => {
  const folderRef = doc(foldersCol);
  const folder: Folder = {
    id: folderRef.id,
    userId,
    name,
    color,
    noteCount: 0,
    createdAt: Timestamp.now()
  };

  await setDoc(folderRef, folder);
  return folderRef.id;
};

/**
 * Update folder properties
 */
export const updateFolder = async (folderId: string, name: string, color: string): Promise<void> => {
  const folderRef = doc(db, 'folders', folderId);
  await updateDoc(folderRef, { name, color });
};

/**
 * Delete folder (re-routing nested notes to unassigned folderId: null)
 */
export const deleteFolder = async (folderId: string): Promise<void> => {
  const folderRef = doc(db, 'folders', folderId);
  await deleteDoc(folderRef);

  // Dissociate notes currently residing in this folder
  const q = query(notesCol, where('folderId', '==', folderId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.forEach((noteDoc) => {
    batch.update(noteDoc.ref, {
      folderId: null,
      updatedAt: Timestamp.now()
    });
  });
  await batch.commit();
};
