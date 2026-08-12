import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSession, setBootstrapped, logoutLocal } from '../store/authSlice';
import { authApi } from '../api/authApi';
import { readErrorCode } from '../api/baseQuery';

/**
 * Runs the §4.2 boot sequence exactly once on mount:
 *  GET /auth/csrf  →  POST /auth/refresh (if csrf OK)
 */
export function useSessionBootstrap() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const csrfRes = await dispatch(authApi.endpoints.csrf.initiate(undefined));
        if (csrfRes.error) {
          dispatch(setBootstrapped());
          return;
        }
        const csrfToken = csrfRes.data?.csrfToken;
        if (!csrfToken) {
          dispatch(setBootstrapped());
          return;
        }
        dispatch(setSession({ csrfToken }));

        const refreshRes = await dispatch(
          authApi.endpoints.refresh.initiate(undefined)
        );
        if (refreshRes.error) {
          const code = readErrorCode(refreshRes.error as never);
          if (code !== 'NO_REFRESH_COOKIE' && code !== 'INVALID_REFRESH_TOKEN') {
            // any other failure → clean state, treat as anonymous (no loop)
          }
          dispatch(logoutLocal());
          dispatch(setBootstrapped());
          return;
        }
        const { accessToken, csrfToken: newCsrf } = refreshRes.data ?? {};
        if (accessToken) {
          dispatch(setSession({ accessToken, csrfToken: newCsrf }));
          const meRes = await dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true }));
          if (meRes.error || !meRes.data?.user) {
            dispatch(logoutLocal());
            dispatch(setBootstrapped());
          }
        } else {
          dispatch(setBootstrapped());
        }
      } catch {
        dispatch(setBootstrapped());
      }
    })();
  }, [dispatch]);

  return status;
}

export function useAuth() {
  const { status, user } = useAppSelector((s) => s.auth);
  return { status, user, isAuthenticated: status === 'authenticated' && !!user };
}
