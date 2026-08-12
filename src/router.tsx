import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { NotFoundPage, PageSkeleton } from './components/state';
import { useAuth } from './hooks/useAuth';

const HomePage = lazy(() => import('./features/home/HomePage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const TwoFactorPage = lazy(() => import('./features/auth/TwoFactorPage'));
const SearchPage = lazy(() => import('./features/search/SearchPage'));
const MovieDetailPage = lazy(() => import('./features/movie/MovieDetailPage'));
const RecommendationsPage = lazy(() => import('./features/recommend/RecommendationsPage'));
const LibraryPage = lazy(() => import('./features/library/LibraryPage'));
const PlaylistPage = lazy(() => import('./features/library/PlaylistPage'));
const FavouritesPage = lazy(() => import('./features/library/FavouritesPage'));
const WatchlistPage = lazy(() => import('./features/library/WatchlistPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const SecurityPage = lazy(() => import('./features/settings/SecurityPage'));
const SessionsPage = lazy(() => import('./features/settings/SessionsPage'));

function LazyBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, isAuthenticated } = useAuth();
  if (status === 'booting') return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status, isAuthenticated } = useAuth();
  if (status === 'booting') return <PageSkeleton />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const lazyPage = (page: ReactNode) => <LazyBoundary>{page}</LazyBoundary>;
const protectedPage = (page: ReactNode) => (
  <RequireAuth><LazyBoundary>{page}</LazyBoundary></RequireAuth>
);
const publicOnlyPage = (page: ReactNode) => (
  <RedirectIfAuthenticated><LazyBoundary>{page}</LazyBoundary></RedirectIfAuthenticated>
);

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: lazyPage(<HomePage />) },
      { path: 'login', element: publicOnlyPage(<LoginPage />) },
      { path: 'register', element: publicOnlyPage(<RegisterPage />) },
      { path: 'verify-2fa', element: publicOnlyPage(<TwoFactorPage />) },
      { path: 'search', element: lazyPage(<SearchPage />) },
      { path: 'movie/:imdbId', element: protectedPage(<MovieDetailPage />) },
      { path: 'recommendations', element: protectedPage(<RecommendationsPage />) },
      { path: 'library', element: protectedPage(<LibraryPage />) },
      { path: 'library/playlists/:playlistId', element: protectedPage(<PlaylistPage />) },
      { path: 'library/favourites', element: protectedPage(<FavouritesPage />) },
      { path: 'library/watchlist', element: protectedPage(<WatchlistPage />) },
      { path: 'profile', element: protectedPage(<ProfilePage />) },
      { path: 'settings', element: protectedPage(<SettingsPage />) },
      { path: 'settings/security', element: protectedPage(<SecurityPage />) },
      { path: 'settings/sessions', element: protectedPage(<SessionsPage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
