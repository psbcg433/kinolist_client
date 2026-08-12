import { useCallback, useEffect, useState } from 'react';
import {
  clearActivity,
  listActivity,
  recordActivity,
} from '../lib/recentActivity';
import type {
  RecentActivityEvent,
  RecentActivityMovie,
  RecentActivityType,
} from '../api/types';

/**
 * Reads/writes the §5.6 frontend-only activity log (localStorage).
 * Reacts to cross-tab changes via the `storage` event.
 */
export function useRecentActivity() {
  const [events, setEvents] = useState<RecentActivityEvent[]>(() => listActivity());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key.endsWith('.recentActivity')) {
        setEvents(listActivity());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const record = useCallback((type: RecentActivityType, payload: { query?: string; movie?: RecentActivityMovie }) => {
    const next = recordActivity(type, payload);
    setEvents(next);
  }, []);

  const clear = useCallback(() => {
    clearActivity();
    setEvents([]);
  }, []);

  return { events, record, clear };
}
