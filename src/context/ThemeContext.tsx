'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { getUserThemePreference, saveUserThemePreference } from '@/lib/firebase/firestore';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  // Apply theme class to <html> and cache in localStorage
  const applyTheme = (t: Theme) => {
    const root = window.document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', t);
  };

  useEffect(() => {
    // 1. Apply localStorage or system default theme immediately to avoid flash
    const cached = localStorage.getItem('theme') as Theme | null;
    const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = cached ?? systemPref;
    setTheme(initial);
    applyTheme(initial);

    // 2. Wait for Firebase Auth to resolve before fetching and overriding from database
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const saved = await getUserThemePreference(user.uid);
        if (saved) {
          setTheme(saved);
          applyTheme(saved);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = async () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);

    // Persist to Firestore if the user is logged in
    const user = auth.currentUser;
    if (user) {
      await saveUserThemePreference(user.uid, next);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
