import {
  RECENT_ACTIVITY_STORAGE_KEY,
  RECENT_ACTIVITY_CAP,
  RECENT_ACTIVITY_TTL_DAYS,
} from './constants';
import type { RecentActivityEvent, RecentActivityMovie, RecentActivityType } from '../api/types';

const TTL_MS = RECENT_ACTIVITY_TTL_DAYS * 24 * 60 * 60 * 1000;

function read(): RecentActivityEvent[] {
  try {
    const raw = window.localStorage.getItem(RECENT_ACTIVITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter((e) => e && typeof e.at === 'number' && now - e.at < TTL_MS);
  } catch {
    return [];
  }
}

function write(events: RecentActivityEvent[]) {
  try {
    window.localStorage.setItem(RECENT_ACTIVITY_STORAGE_KEY, JSON.stringify(events));
  } catch {
    // quota/private-mode — degrade silently, recent activity is best-effort
  }
}

function dedupeKey(e: RecentActivityEvent): string {
  if (e.type === 'search') return `${e.type}:${e.query ?? ''}`;
  return `${e.type}:${e.movie?.imdbId ?? ''}`;
}

export function recordActivity(
  type: RecentActivityType,
  payload: { query?: string; movie?: RecentActivityMovie }
): RecentActivityEvent[] {
  const events = read();
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
  write(next);
  return next;
}

export function listActivity(): RecentActivityEvent[] {
  const events = read().sort((a, b) => b.at - a.at);
  if (events.length !== read().length) write(events);
  return events;
}

export function clearActivity() {
  try {
    window.localStorage.removeItem(RECENT_ACTIVITY_STORAGE_KEY);
  } catch {
    // ignore
  }
}
