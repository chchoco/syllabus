import { AppDatabaseState } from '../types';
import { INITIAL_DATA } from '../constants';
import { loadFromFirestore, saveToFirestore, subscribeToFirestore } from './firebase';

const LOCAL_STORAGE_KEY = 'ai_basic_progress_data_v3';

export { subscribeToFirestore };

export async function fetchProgressDatabase(): Promise<AppDatabaseState> {
  // 1. Try Firebase Firestore Cloud Database first
  try {
    const cloudData = await loadFromFirestore();
    if (cloudData) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
      } catch (e) {
        console.warn('LocalStorage save warning', e);
      }
      return cloudData;
    }
  } catch (cloudErr) {
    console.warn('Firestore fetch failed, checking server API:', cloudErr);
  }

  // 2. Try Server API
  try {
    const res = await fetch('/api/progress');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        // Save initial state to Firestore if not yet stored
        saveToFirestore(json.data).catch(() => {});
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Server fetch failed, falling back to localStorage cache:', err);
  }

  // 3. Fallback: localStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('LocalStorage parse error:', e);
  }

  return INITIAL_DATA as AppDatabaseState;
}

export async function saveProgressDatabase(data: AppDatabaseState): Promise<{ success: boolean; lastSavedAt?: string; message?: string }> {
  // Always update localStorage first for instant responsiveness
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  // Save to Firebase Firestore (Global Cloud Database across all devices)
  try {
    const cloudResult = await saveToFirestore(data);
    
    // Also mirror to local express server
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});

    return { 
      success: true, 
      lastSavedAt: cloudResult.lastSavedAt, 
      message: '클라우드 DB(Firestore)에 안전하게 저장됨' 
    };
  } catch (err) {
    console.error('Firestore save error, falling back to server DB:', err);

    // Fallback: save to express server
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        return { success: true, lastSavedAt: json.lastSavedAt, message: '서버 DB에 저장됨' };
      }
    } catch (serverErr) {
      console.error('Server save error:', serverErr);
    }

    return { success: true, message: '로컬 브라우저에 저장됨 (오프라인)' };
  }
}

export async function resetProgressDatabase(): Promise<AppDatabaseState> {
  const defaultState = {
    ...INITIAL_DATA,
    lastSavedAt: new Date().toISOString()
  } as AppDatabaseState;

  try {
    await saveToFirestore(defaultState);
  } catch (err) {
    console.error('Firestore reset error:', err);
  }

  try {
    await fetch('/api/progress/reset', { method: 'POST' });
  } catch (err) {
    console.error('Reset request failed:', err);
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultState));
  return defaultState;
}

