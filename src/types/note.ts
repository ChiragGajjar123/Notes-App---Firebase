import { Timestamp } from 'firebase/firestore';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  plainText: string;
  color: string;
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: Timestamp | null;
  wordCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic?: boolean;
}
