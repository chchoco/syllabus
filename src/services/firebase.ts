import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppDatabaseState } from '../types';
import { INITIAL_DATA } from '../constants';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const PROGRESS_DOC_ID = 'main_progress';
const COLLECTION_NAME = 'progress_records';

/**
 * Load progress data from Firestore Cloud Database
 */
export async function loadFromFirestore(): Promise<AppDatabaseState | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, PROGRESS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppDatabaseState;
    }
    return null;
  } catch (error) {
    console.error('Failed to load from Firestore:', error);
    return null;
  }
}

/**
 * Save progress data to Firestore Cloud Database
 */
export async function saveToFirestore(data: AppDatabaseState): Promise<{ success: boolean; lastSavedAt: string }> {
  const timestamp = new Date().toISOString();
  const dataToSave = {
    ...data,
    lastSavedAt: timestamp
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, PROGRESS_DOC_ID);
    await setDoc(docRef, dataToSave, { merge: true });
    return { success: true, lastSavedAt: timestamp };
  } catch (error) {
    console.error('Failed to save to Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time Cloud updates so multiple devices sync instantaneously
 */
export function subscribeToFirestore(
  onUpdate: (data: AppDatabaseState) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTION_NAME, PROGRESS_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as AppDatabaseState);
      }
    },
    (error) => {
      console.warn('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );
}
