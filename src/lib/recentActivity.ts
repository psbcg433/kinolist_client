import {
  LEGACY_RECENT_ACTIVITY_STORAGE_KEY,
  RECENT_ACTIVITY_CAP,
  RECENT_ACTIVITY_TTL_DAYS,
} from './constants';
import type { RecentActivityEvent, RecentActivityMovie, RecentActivityType } from '../api/types';

const TTL_MS = RECENT_ACTIVITY_TTL_DAYS * 24 * 60 * 60 * 1000;
export const RECENT_ACTIVITY_UPDATED_EVENT = 'kinolist:recent-activity-updated';

function read(storageKey: string): RecentActivityEvent[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter((e) => e && typeof e.at === 'number' && now - e.at < TTL_MS);
  } catch {
    return [];
  }
}

function write(storageKey: string, events: RecentActivityEvent[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(events));
  } catch {
    // quota/private-mode — degrade silently, recent activity is best-effort
  }
}

function dedupeKey(e: RecentActivityEvent): string {
  if (e.type === 'search') return `${e.type}:${e.query ?? ''}`;
  return `${e.type}:${e.movie?.imdbId ?? ''}`;
}

export function recordActivity(
  storageKey: string,
  type: RecentActivityType,
  payload: { query?: string; movie?: RecentActivityMovie }
): RecentActivityEvent[] {
  const events = read(storageKey);
  const event: RecentActivityEvent = {
    id: crypto.randomUUID(),
    type,
    at: Date.now(),
    query: payload.query,
    movie: payload.movie,
  };
  const key = dedupeKey(event);
  const rest = events.filter((e) => dedupeKey(e) !== key);
  const next = [event, ...rest].slice(0, RECENT_ACTIVITY_CAP);
  write(storageKey, next);
  window.dispatchEvent(new CustomEvent(RECENT_ACTIVITY_UPDATED_EVENT, { detail: { storageKey } }));
  return next;
}

export function listActivity(storageKey: string): RecentActivityEvent[] {
  const stored = read(storageKey);
  const events = [...stored].sort((a, b) => b.at - a.at);
  if (events.length !== stored.length) write(storageKey, events);
  return events;
}

export function clearActivity(storageKey: string) {
  try {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new CustomEvent(RECENT_ACTIVITY_UPDATED_EVENT, { detail: { storageKey } }));
  } catch {
    // ignore
  }
}

export function clearLegacyActivity() {
  try {
    window.localStorage.removeItem(LEGACY_RECENT_ACTIVITY_STORAGE_KEY);
  } catch {
    // ignore
  }
}
