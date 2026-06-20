import { Timestamp } from 'firebase/firestore';

/**
 * Formats a Firestore Timestamp or standard Date into a readable user-friendly string.
 * Example: "Today at 3:30 PM", "Yesterday at 11:15 AM", or "Oct 24, 2026 at 2:00 PM"
 */
export function formatDate(timestamp: Timestamp | Date | null | undefined): string {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();
                  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() &&
                      date.getMonth() === yesterday.getMonth() &&
                      date.getFullYear() === yesterday.getFullYear();

  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Today, ${timeString}`;
  } else if (isYesterday) {
    return `Yesterday, ${timeString}`;
  } else {
    const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    return `${dateString}, ${timeString}`;
  }
}

/**
 * Returns a short date format for sidebar lists or grid views.
 */
export function formatDateShort(timestamp: Timestamp | Date | null | undefined): string {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();
                  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
