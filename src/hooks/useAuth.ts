import { useAuthContext } from '@/context/AuthContext';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, logOut, sendResetEmail, checkEmailExists } from '@/lib/firebase/auth';

/**
 * Custom hook to retrieve current auth context states and trigger login/logout flows.
 */
export function useAuth() {
  const { user, loading } = useAuthContext();

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logOut,
    sendResetEmail,
    checkEmailExists
  };
}
