import { Timestamp } from 'firebase/firestore';

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string;
  noteCount: number;
  createdAt: Timestamp;
}
