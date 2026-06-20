import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  User
} from 'firebase/auth';
import { auth, googleProvider } from './config';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign up with email, password and display name
 */
export const signUpWithEmail = async (email: string, password: string, name: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Set default initial-based avatar from Dicebear
  await updateProfile(user, {
    displayName: name,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  });
  
  return user;
};

/**
 * Sign in with Google OAuth popup
 */
export const signInWithGoogle = async (): Promise<User> => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  return userCredential.user;
};

/**
 * Sign out the currently logged in user
 */
export const logOut = async (): Promise<void> => {
  await signOut(auth);
};
