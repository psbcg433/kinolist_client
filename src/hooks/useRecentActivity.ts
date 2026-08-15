import { useCallback, useEffect, useState } from 'react';
import {
  clearActivity,
  clearLegacyActivity,
  listActivity,
  RECENT_ACTIVITY_UPDATED_EVENT,
  recordActivity,
} from '../lib/recentActivity';
import type {
  RecentActivityEvent,
  RecentActivityMovie,
  RecentActivityType,
} from '../api/types';
import { recentActivityStorageKey } from '../lib/constants';
import { useAppSelector } from '../store/hooks';

/**
 * Reads/writes the §5.6 frontend-only activity log (localStorage).
 * Reacts to cross-tab changes via the `storage` event.
 */
export function useRecentActivity() {
  const status = useAppSelector((state) => state.auth.status);
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const storageKey = status === 'authenticated' && userId
    ? recentActivityStorageKey(userId)
    : status === 'anonymous'
      ? recentActivityStorageKey(null)
      : null;
  const [events, setEvents] = useState<RecentActivityEvent[]>([]);

  useEffect(() => {
    clearLegacyActivity();
  }, []);

  useEffect(() => {
    setEvents(storageKey ? listActivity(storageKey) : []);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === storageKey) {
        setEvents(listActivity(storageKey));
      }
    };
    const onLocalUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ storageKey?: string }>).detail;
      if (detail?.storageKey === storageKey) setEvents(listActivity(storageKey));
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(RECENT_ACTIVITY_UPDATED_EVENT, onLocalUpdate);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(RECENT_ACTIVITY_UPDATED_EVENT, onLocalUpdate);
    };
  }, [storageKey]);

  const record = useCallback((type: RecentActivityType, payload: { query?: string; movie?: RecentActivityMovie }) => {
    if (!storageKey) return;
    const next = recordActivity(storageKey, type, payload);
    setEvents(next);
  }, [storageKey]);

  const clear = useCallback(() => {
    if (!storageKey) return;
    clearActivity(storageKey);
    setEvents([]);
  }, [storageKey]);

  return { events, record, clear };
}
