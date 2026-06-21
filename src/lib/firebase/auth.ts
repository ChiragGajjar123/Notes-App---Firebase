import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  User
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import { serverCheckEmailExists } from '@/app/actions/authActions';

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

/**
 * Send a password reset email
 */
export const sendResetEmail = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Check if an email is registered
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const exists = await serverCheckEmailExists(email);
    return exists;
  } catch (serverErr) {
    console.warn('Server check failed, falling back to client-side check:', serverErr);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (err: any) {
      if (err.code === 'auth/admin-restricted-operation') {
        // Fallback for production where email enumeration protection is active
        return true;
      }
      throw err;
    }
  }
};
