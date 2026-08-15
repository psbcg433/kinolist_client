import { configureStore, type Middleware } from '@reduxjs/toolkit';
import authReducer, { logoutLocal, setSession, setUser } from './authSlice';
import uiReducer from './uiSlice';
import { authApi } from '../api/authApi';
import { profileApi } from '../api/profileApi';
import { libraryApi } from '../api/libraryApi';
import { movieApi } from '../api/movieApi';
import { discoveryApi } from '../api/discoveryApi';

type AccountState = {
  auth: {
    user: { id: string } | null;
  };
};

/**
 * RTK Query keeps fulfilled responses in memory after components unmount.
 * Clear every API cache at an account boundary so a second user can never see
 * the previous user's profile, library, recommendations, or search results.
 */
const accountBoundaryMiddleware: Middleware = ({ dispatch, getState }) => (next) => (action) => {
  const previousUserId = (getState() as AccountState).auth.user?.id ?? null;
  const isLogout = logoutLocal.match(action);
  const canChangeIdentity = setSession.match(action) || setUser.match(action);
  const result = next(action);
  const currentUserId = (getState() as AccountState).auth.user?.id ?? null;
  const switchedAccount = canChangeIdentity
    && previousUserId !== null
    && currentUserId !== null
    && previousUserId !== currentUserId;

  if (isLogout || switchedAccount) {
    dispatch(authApi.util.resetApiState());
    dispatch(profileApi.util.resetApiState());
    dispatch(libraryApi.util.resetApiState());
    dispatch(movieApi.util.resetApiState());
    dispatch(discoveryApi.util.resetApiState());
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [libraryApi.reducerPath]: libraryApi.reducer,
    [movieApi.reducerPath]: movieApi.reducer,
    [discoveryApi.reducerPath]: discoveryApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      authApi.middleware,
      profileApi.middleware,
      libraryApi.middleware,
      movieApi.middleware,
      discoveryApi.middleware,
      accountBoundaryMiddleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
