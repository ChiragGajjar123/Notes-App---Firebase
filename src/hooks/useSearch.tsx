import React, { useCallback } from 'react';

/**
 * Custom hook to manage client-side text highlighting for searched matches.
 */
export function useSearch() {
  /**
   * Scans a text block and wraps instances matching the search query in a styled `<mark>` tag.
   * Returns React.ReactNode (array of strings and JSX elements) for safe rendering.
   */
  const highlightText = useCallback((text: string, query: string): React.ReactNode => {
    if (!query || !query.trim() || !text) return text;
    
    const trimmedQuery = query.trim();
    // Escape special characters to construct a safe regex search token
    const escapedQuery = trimmedQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark 
          key={index} 
          className="bg-yellow-200 dark:bg-yellow-900/60 text-yellow-950 dark:text-yellow-100 rounded px-0.5 font-semibold transition-colors duration-150"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, []);

  return { highlightText };
}
