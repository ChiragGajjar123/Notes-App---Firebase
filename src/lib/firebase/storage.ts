import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Uploads an image to Firebase Storage and returns the public download URL.
 * Saved under users/{userId}/images/{timestamp}_{fileName}
 */
export const uploadImage = async (userId: string, file: File): Promise<string> => {
  if (!userId) throw new Error("User must be authenticated to upload files.");
  
  // Sanitize filename to avoid folder breakages
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const uniqueName = `${Date.now()}_${sanitizedName}`;
  const filePath = `users/${userId}/images/${uniqueName}`;
  
  const fileRef = ref(storage, filePath);
  
  // Upload raw file bytes
  const snapshot = await uploadBytes(fileRef, file);
  
  // Retrieve public URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};
