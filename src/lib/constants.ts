export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? 'KinoList';

export const REFRESH_COOKIE_NAME = 'kinolist_refresh';

export const AI_SEARCH_HARD_LIMIT: number =
  Number(import.meta.env.VITE_AI_SEARCH_HARD_LIMIT) || 5;

export const IMAGE_MAX_BYTES: number =
  Number(import.meta.env.VITE_IMAGE_MAX_BYTES) || 5 * 1024 * 1024;

export const RECENT_ACTIVITY_STORAGE_KEY = 'kinolist.recentActivity';

export const RECENT_ACTIVITY_CAP: number =
  Number(import.meta.env.VITE_RECENT_ACTIVITY_CAP) || 10;

export const RECENT_ACTIVITY_TTL_DAYS: number =
  Number(import.meta.env.VITE_RECENT_ACTIVITY_TTL_DAYS) || 30;

export const RECENT_SECTIONS_MAX: number =
  Number(import.meta.env.VITE_RECENT_SECTIONS_MAX) || 4;

export const SEARCH_DEBOUNCE_MS = 350;

export const GENRES = [
  'action',
  'adventure',
  'animation',
  'comedy',
  'crime',
  'documentary',
  'drama',
  'family',
  'fantasy',
  'history',
  'horror',
  'mystery',
  'romance',
  'sci-fi',
  'sport',
  'thriller',
  'war',
  'western',
] as const;

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
