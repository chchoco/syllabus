import { AppDatabaseState } from '../types';
import { INITIAL_DATA } from '../constants';

const LOCAL_STORAGE_KEY = 'ai_basic_progress_data_v3';

export async function fetchProgressDatabase(): Promise<AppDatabaseState> {
  try {
    const res = await fetch('/api/progress');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        // Backup to localStorage as secondary cache
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
        } catch (e) {
          console.warn('LocalStorage save warning', e);
        }
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Server fetch failed, falling back to localStorage cache:', err);
  }

  // Fallback: localStorage
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
  // Always update localStorage first for immediate zero-latency local persistence
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  // Send to server database API
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, lastSavedAt: json.lastSavedAt, message: 'DB에 안전하게 저장됨' };
    }
    return { success: false, message: '서버 응답 오류' };
  } catch (err) {
    console.error('Server save error:', err);
    return { success: true, message: '로컬 브라우저에 저장됨 (오프라인)' };
  }
}

export async function resetProgressDatabase(): Promise<AppDatabaseState> {
  try {
    const res = await fetch('/api/progress/reset', { method: 'POST' });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.error('Reset request failed:', err);
  }

  const defaultState = INITIAL_DATA as AppDatabaseState;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultState));
  return defaultState;
}
