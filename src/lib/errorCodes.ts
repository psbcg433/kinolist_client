export type ErrorBehavior =
  | 'session' // handled centrally in baseQuery (401 family)
  | 'form' // show details[] inline
  | 'toast' // non-fatal, show a snackbar
  | 'page'; // render ErrorState

export const ERROR_CODES: Record<string, ErrorBehavior> = {
  VALIDATION_FAILED: 'form',
  INVALID_TWO_FACTOR_CODE: 'form',
  TWO_FA_NOT_SETUP: 'toast',
  SYSTEM_PLAYLIST_IMMUTABLE: 'toast',
  INVALID_IMAGE_TYPE: 'form',
  INVALID_IMAGE_CONTENT: 'form',

  UNAUTHENTICATED: 'session',
  INVALID_ACCESS_TOKEN: 'session',
  TOKEN_REVOKED: 'session',
  SESSION_REVOKED: 'session',
  TOKEN_VERSION_CHANGED: 'session',
  ACCOUNT_UNAVAILABLE: 'session',
  NO_REFRESH_COOKIE: 'session',
  INVALID_REFRESH_TOKEN: 'session',
  REFRESH_TOKEN_EXPIRED: 'session',
  REFRESH_TOKEN_REUSE: 'session',

  FORBIDDEN: 'page',
  CSRF_INVALID: 'session',
  INVALID_CREDENTIALS: 'form',

  NOT_FOUND: 'page',
  PROFILE_NOT_FOUND: 'page',
  PLAYLIST_NOT_FOUND: 'page',
  MOVIE_NOT_FOUND: 'page',
  SESSION_NOT_FOUND: 'toast',
  USER_NOT_FOUND: 'page',

  EMAIL_EXISTS: 'form',
  PLAYLIST_NAME_EXISTS: 'form',
  PLAYLIST_LIMIT_REACHED: 'toast',
  TWO_FA_ALREADY_ENABLED: 'toast',
  TWO_FACTOR_NOT_ENABLED: 'toast',

  CHALLENGE_INVALID: 'form',
  CONTENT_LENGTH_REQUIRED: 'toast',
  PAYLOAD_TOO_LARGE: 'toast',
  IMAGE_TOO_LARGE: 'form',

  RATE_LIMITED: 'toast',
  TWO_FACTOR_CHALLENGE_LOCKED: 'form',
  AI_RATE_LIMITED: 'toast',

  UPSTREAM_UNAVAILABLE: 'page',
  PEER_ERROR: 'toast',
  PEER_UNAVAILABLE: 'page',
  IMAGE_UPLOAD_FAILED: 'toast',
  AUTHORIZATION_UNAVAILABLE: 'page',
  RATE_LIMIT_UNAVAILABLE: 'toast',
  AI_UNAVAILABLE: 'toast',
  NOT_READY: 'page',
  INTERNAL_ERROR: 'page',
};

export function getErrorBehavior(code: string): ErrorBehavior {
  return ERROR_CODES[code] ?? 'page';
}

export const SESSION_ERROR_CODES = new Set([
  'UNAUTHENTICATED',
  'INVALID_ACCESS_TOKEN',
  'TOKEN_REVOKED',
  'SESSION_REVOKED',
  'TOKEN_VERSION_CHANGED',
  'ACCOUNT_UNAVAILABLE',
  'NO_REFRESH_COOKIE',
  'INVALID_REFRESH_TOKEN',
  'REFRESH_TOKEN_EXPIRED',
  'REFRESH_TOKEN_REUSE',
  'CSRF_INVALID',
]);

/** Codes for which we must NOT silently refresh (re-auth required). */
export const NO_AUTO_REFRESH_CODES = new Set([
  'REFRESH_TOKEN_REUSE',
  'TOKEN_VERSION_CHANGED',
  'SESSION_REVOKED',
  'ACCOUNT_UNAVAILABLE',
]);
