import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '../lib/constants';
import type { RootState } from '../store';
import { setSession, logoutLocal, setBootstrapped } from '../store/authSlice';
import { NO_AUTO_REFRESH_CODES, SESSION_ERROR_CODES } from '../lib/errorCodes';

interface SuccessEnvelope {
  success: true;
  data: unknown;
  meta?: Record<string, unknown>;
  requestId?: string | null;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const { accessToken, csrfToken } = (getState() as RootState).auth;
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
    return headers;
  },
});

type Args = string | FetchArgs;

export function readErrorCode(
  err?: { status?: number; data?: unknown } | FetchBaseQueryError
): string | null {
  const data = (err as { data?: { error?: { code?: string } } })?.data;
  return data?.error?.code ?? null;
}

export function readErrorMessage(err?: { status?: number; data?: unknown }): string | null {
  const data = (err as { data?: { error?: { message?: string } } })?.data;
  return data?.error?.message ?? null;
}

export function readErrorDetails(err?: { status?: number; data?: unknown }): unknown {
  const data = (err as { data?: { error?: { details?: unknown } } })?.data;
  return data?.error?.details ?? [];
}

function urlOf(args: Args): string {
  return typeof args === 'string' ? args : args.url;
}

function isRefreshCall(args: Args): boolean {
  const url = urlOf(args);
  return url === '/auth/refresh';
}

type RawQueryResult = Awaited<ReturnType<typeof rawBaseQuery>>;

function unwrapEnvelope(result: RawQueryResult): RawQueryResult {
  if (result.error) return result;
  const envelope = result.data as SuccessEnvelope | undefined;
  if (!envelope || envelope.success !== true || !('data' in envelope)) return result;

  const payload = envelope.data;
  const meta = envelope.meta ?? {};
  const data = payload && typeof payload === 'object' && !Array.isArray(payload)
    ? { ...payload as Record<string, unknown>, ...(Object.keys(meta).length ? { meta } : {}) }
    : payload;

  return { data, meta: result.meta } as RawQueryResult;
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Custom baseQuery wrapping fetchBaseQuery with single-flight refresh-on-401.
 * Per §4.4 of ARCHITECTURE.md:
 *  1. 401 + code in SESSION_ERROR_CODES (not NO_AUTO_REFRESH) triggers refresh.
 *  2. A module-level promise dedupes concurrent refreshes.
 *  3. On success: update authSlice, replay the original request once.
 *  4. On failure: logoutLocal + navigate handled by the caller (listener).
 */
const baseQueryWithRefresh: BaseQueryFn<
  Args,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const result = unwrapEnvelope(await rawBaseQuery(args, api, extraOptions));

  const code = (result.error as { data?: { error?: { code?: string } } })?.data?.error?.code ?? null;
  const isSessionError = code ? SESSION_ERROR_CODES.has(code) : result.error?.status === 401;
  const noAutoRefresh = code ? NO_AUTO_REFRESH_CODES.has(code) : false;
  const state = api.getState() as RootState;

  if (!isSessionError || noAutoRefresh || isRefreshCall(args) || !state.auth.accessToken) {
    return result;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = unwrapEnvelope(await rawBaseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        ));
        if (res.error) return false;
        const data = res.data as { accessToken?: string; csrfToken?: string } | undefined;
        if (!data?.accessToken) return false;
        api.dispatch(
          setSession({ accessToken: data.accessToken, csrfToken: data.csrfToken })
        );
        return true;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  const refreshed = await refreshPromise;

  if (!refreshed) {
    api.dispatch(logoutLocal());
    api.dispatch(setBootstrapped());
    return result;
  }

  // refresh success — replay the original request once
  return unwrapEnvelope(await rawBaseQuery(args, api, extraOptions));
};

export default baseQueryWithRefresh;
