import { openDB } from 'idb';

const dbPromise = openDB('trafficStopCoach', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('documentation')) {
      db.createObjectStore('documentation');
    }
    if (!db.objectStoreNames.contains('practiceSessions')) {
      db.createObjectStore('practiceSessions', { keyPath: 'id', autoIncrement: true });
    }
  }
});

export async function getDocumentation() {
  const db = await dbPromise;
  return db.get('documentation', 'current');
}

export async function saveDocumentation(doc) {
  const db = await dbPromise;
  return db.put('documentation', doc, 'current');
}

export async function logPracticeSession(entry) {
  const db = await dbPromise;
  return db.add('practiceSessions', {
    ...entry,
    createdAt: entry.createdAt || new Date().toISOString()
  });
}
