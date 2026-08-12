import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import type {
  AuthUser,
  Credentials,
  LoginResult,
  SessionInfo,
  TwoFactorChallenge,
} from './types';
import { setSession, setChallenge, setUser } from '../store/authSlice';

export interface RegisterArgs {
  email: string;
  password: string;
  name?: string;
}

export interface TwoFactorSetupResult {
  challengeId: string;
  expiresInSeconds: number;
  delivery: { channel: 'email'; destination: string };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth', 'Sessions'],
  endpoints: (build) => ({
    csrf: build.query<{ csrfToken: string }, void>({
      query: () => '/auth/csrf',
    }),
    refresh: build.mutation<{ accessToken: string; csrfToken: string }, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
    register: build.mutation<{ registered: true }, RegisterArgs>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: build.mutation<LoginResult, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if ('accessToken' in data && data.accessToken) {
            const creds = data as Credentials;
            dispatch(setSession({ user: creds.user, accessToken: creds.accessToken, csrfToken: creds.csrfToken }));
          } else if ('requiresTwoFactor' in data) {
            const challenge = data as TwoFactorChallenge;
            dispatch(
              setChallenge({
                challengeId: challenge.challengeId,
                expiresInSeconds: challenge.expiresInSeconds,
                delivery: challenge.delivery,
              })
            );
          }
        } catch {
          // error surfaced by caller
        }
      },
    }),
    verify2faLogin: build.mutation<Credentials, { challengeId: string; code: string }>({
      query: (body) => ({ url: '/auth/2fa/login/verify', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setSession({ user: data.user, accessToken: data.accessToken, csrfToken: data.csrfToken }));
          dispatch({ type: 'auth/clearChallenge' });
        } catch {
          // error surfaced by caller
        }
      },
    }),
    me: build.query<{ user: AuthUser }, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch {
          // handled centrally in baseQuery
        }
      },
    }),
    logout: build.mutation<{ loggedOut: true }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Auth', 'Sessions'],
    }),
    logoutAll: build.mutation<{ loggedOut: true; allSessions: true }, void>({
      query: () => ({ url: '/auth/logout-all', method: 'POST' }),
      invalidatesTags: ['Auth', 'Sessions'],
    }),
    listSessions: build.query<{ sessions: SessionInfo[] }, void>({
      query: () => '/auth/sessions',
      providesTags: ['Sessions'],
    }),
    revokeSession: build.mutation<{ revoked: true; sessionId: string }, string>({
      query: (sessionId) => ({ url: `/auth/sessions/${sessionId}`, method: 'DELETE' }),
      invalidatesTags: ['Sessions'],
    }),
    setup2fa: build.mutation<TwoFactorSetupResult, { password: string }>({
      query: (body) => ({ url: '/auth/2fa/setup', method: 'POST', body }),
    }),
    setup2faVerify: build.mutation<{ enabled: true }, { challengeId: string; code: string }>({
      query: (body) => ({ url: '/auth/2fa/setup/verify', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    reset2fa: build.mutation<{ enabled: false }, { password: string }>({
      query: (body) => ({ url: '/auth/2fa/reset', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    deleteAccount: build.mutation<{ deleted: true }, { password: string }>({
      query: (body) => ({ url: '/auth/account', method: 'DELETE', body }),
      invalidatesTags: ['Auth', 'Sessions'],
    }),
  }),
});

export const {
  useCsrfQuery,
  useRefreshMutation,
  useRegisterMutation,
  useLoginMutation,
  useVerify2faLoginMutation,
  useMeQuery,
  useLogoutMutation,
  useLogoutAllMutation,
  useListSessionsQuery,
  useRevokeSessionMutation,
  useSetup2faMutation,
  useSetup2faVerifyMutation,
  useReset2faMutation,
  useDeleteAccountMutation,
} = authApi;
