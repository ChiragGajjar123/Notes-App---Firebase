import { Note } from '@/types/note';
import { Folder } from '@/types/folder';

const PROJECT_ID = 'notes-app-1a245';

function decodeJwtUid(token: string): string | null {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('ascii');
    const payload = JSON.parse(payloadJson);
    return payload.user_id || payload.sub || null;
  } catch (err) {
    console.error('Error decoding token payload:', err);
    return null;
  }
}

function parseFirestoreValue(val: any): any {
  if (!val) return null;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.integerValue !== undefined) return parseInt(val.integerValue, 10);
  if (val.doubleValue !== undefined) return parseFloat(val.doubleValue);
  if (val.timestampValue !== undefined) {
    const date = new Date(val.timestampValue);
    return {
      toMillis: () => date.getTime(),
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1e6
    };
  }
  if (val.arrayValue !== undefined) {
    const values = val.arrayValue.values || [];
    return values.map((v: any) => parseFirestoreValue(v));
  }
  if (val.mapValue !== undefined) {
    const fields = val.mapValue.fields || {};
    const obj: any = {};
    for (let k in fields) {
      obj[k] = parseFirestoreValue(fields[k]);
    }
    return obj;
  }
  if (val.nullValue !== undefined) return null;
  return undefined;
}

function parseFirestoreDocument(doc: any): any {
  if (!doc || !doc.fields) return null;
  const obj: any = {
    id: doc.name.split('/').pop()
  };
  for (let k in doc.fields) {
    obj[k] = parseFirestoreValue(doc.fields[k]);
  }
  return obj;
}

export async function fetchServerNotes(token: string): Promise<Note[]> {
  const userId = decodeJwtUid(token);
  if (!userId) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'notes' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'userId' },
          op: 'EQUAL',
          value: { stringValue: userId }
        }
      },
      orderBy: [
        {
          field: { fieldPath: 'updatedAt' },
          direction: 'DESCENDING'
        }
      ]
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 } // Bypass Next.js cache for real-time fresh data
    });

    if (!response.ok) {
      console.error('Failed to fetch notes from REST API:', response.statusText);
      return [];
    }

    const results = await response.json();
    return results
      .map((r: any) => parseFirestoreDocument(r.document))
      .filter((note: any) => note !== null) as Note[];
  } catch (err) {
    console.error('Error fetching notes via SSR:', err);
    return [];
  }
}

export async function fetchServerFolders(token: string): Promise<Folder[]> {
  const userId = decodeJwtUid(token);
  if (!userId) return [];

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'folders' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'userId' },
          op: 'EQUAL',
          value: { stringValue: userId }
        }
      },
      orderBy: [
        {
          field: { fieldPath: 'createdAt' },
          direction: 'DESCENDING'
        }
      ]
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error('Failed to fetch folders from REST API:', response.statusText);
      return [];
    }

    const results = await response.json();
    return results
      .map((r: any) => parseFirestoreDocument(r.document))
      .filter((folder: any) => folder !== null) as Folder[];
  } catch (err) {
    console.error('Error fetching folders via SSR:', err);
    return [];
  }
}

export async function fetchServerNote(token: string, noteId: string): Promise<Note | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/notes/${noteId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Note ${noteId} not found.`);
      } else {
        console.error(`Failed to fetch note ${noteId} from REST API:`, response.statusText);
      }
      return null;
    }

    const docData = await response.json();
    return parseFirestoreDocument(docData) as Note | null;
  } catch (err) {
    console.error(`Error fetching note ${noteId} via SSR:`, err);
    return null;
  }
}
