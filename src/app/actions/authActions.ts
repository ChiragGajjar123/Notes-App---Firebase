'use server';

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'notes-app-1a245';
    
    // If emulator is active
    if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
      admin.initializeApp({ projectId });
    } else {
      // Production or local dev against prod
      admin.initializeApp({
        projectId: projectId
      });
    }
  } catch (err) {
    console.error('Error initializing Firebase Admin:', err);
  }
}

/**
 * Server-side function to check if an email is registered using Firebase Admin SDK.
 * This bypasses the client-side restrictions of Email Enumeration Protection.
 */
export async function serverCheckEmailExists(email: string): Promise<boolean> {
  try {
    await admin.auth().getUserByEmail(email);
    return true;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      return false;
    }
    // If it's a credentials error (e.g. running locally without credentials),
    // we cannot verify, so we return true as a safe fallback to allow the flow to proceed.
    console.warn('Firebase Admin check failed, falling back to true:', err.message || err);
    return true;
  }
}
