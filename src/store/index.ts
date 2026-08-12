import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import { authApi } from '../api/authApi';
import { profileApi } from '../api/profileApi';
import { libraryApi } from '../api/libraryApi';
import { movieApi } from '../api/movieApi';
import { discoveryApi } from '../api/discoveryApi';

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
      discoveryApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
