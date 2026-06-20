import { MetadataRoute } from 'next';

/**
 * Dynamically exports PWA Manifest configs conforming to Next.js App Router specs.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aether Notes',
    short_name: 'Aether',
    description: 'A premium, offline-first notes application powered by Next.js and Firebase.',
    start_url: '/notes',
    display: 'standalone',
    background_color: '#0f172a', // Slate-900 matching theme base
    theme_color: '#8b5cf6',      // Violet-500 matching brand core
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  };
}
