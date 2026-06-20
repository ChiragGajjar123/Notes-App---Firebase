import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotesProvider } from '@/context/NotesContext';
import { cookies } from 'next/headers';
import { fetchServerNotes, fetchServerFolders } from '@/lib/firebase/firestore-ssr';

export const metadata: Metadata = {
  title: 'Aether Notes — Premium Rich Notes',
  description: 'Organize your thoughts with Aether Notes, a secure, real-time rich text editor application featuring offline sync, speech transcribing, and bulk exports.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aether Notes',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.webmanifest' // Linked dynamically by Next.js manifest generator
};

export const viewport: Viewport = {
  themeColor: '#8b5cf6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('__session')?.value || '';

  const initialNotes = token ? await fetchServerNotes(token) : [];
  const initialFolders = token ? await fetchServerFolders(token) : [];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA mobile app capabilities */}
        <meta name="application-name" content="Aether Notes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Aether Notes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <NotesProvider initialNotes={initialNotes} initialFolders={initialFolders}>
              {children}
            </NotesProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
