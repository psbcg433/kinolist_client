import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, TwoFactorChallenge } from '../api/types';

export type AuthStatus = 'booting' | 'anonymous' | 'authenticated';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  csrfToken: string | null;
  twoFactorChallenge: Omit<TwoFactorChallenge, 'requiresTwoFactor'> | null;
}

const initialState: AuthState = {
  status: 'booting',
  user: null,
  accessToken: null,
  csrfToken: null,
  twoFactorChallenge: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setBootstrapped(state) {
      if (!state.accessToken || !state.user) state.status = 'anonymous';
    },
    setSession(
      state,
      action: PayloadAction<{ user?: AuthUser; accessToken?: string; csrfToken?: string }>
    ) {
      const { user, accessToken, csrfToken } = action.payload;
      if (user !== undefined) state.user = user;
      if (accessToken !== undefined) state.accessToken = accessToken;
      if (csrfToken !== undefined) state.csrfToken = csrfToken;
      if (state.accessToken && state.user) state.status = 'authenticated';
    },
    setChallenge(state, action: PayloadAction<Omit<TwoFactorChallenge, 'requiresTwoFactor'>>) {
      state.twoFactorChallenge = action.payload;
    },
    clearChallenge(state) {
      state.twoFactorChallenge = null;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      if (state.accessToken) state.status = 'authenticated';
    },
    logoutLocal(state) {
      state.status = 'anonymous';
      state.user = null;
      state.accessToken = null;
      state.csrfToken = null;
      state.twoFactorChallenge = null;
    },
  },
});

export const {
  setBootstrapped,
  setSession,
  setChallenge,
  clearChallenge,
  setUser,
  logoutLocal,
} = authSlice.actions;

export default authSlice.reducer;
