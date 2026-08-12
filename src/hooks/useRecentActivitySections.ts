import { useMemo } from 'react';
import { RECENT_SECTIONS_MAX } from '../lib/constants';
import { useRecentActivity } from './useRecentActivity';
import { useAppSelector } from '../store/hooks';
import { libraryApi } from '../api/libraryApi';
import type { RecentActivityEvent } from '../api/types';

export interface RecentActivitySection {
  event: RecentActivityEvent;
  title: string;
  kind: 'search' | 'genre';
  query: string;
}

/**
 * Builds the ≤RECENT_SECTIONS_MAX "Because you…" homepage sections from the
 * §5.6 activity log. Skips events whose movie is already in favourites/watchlist.
 * Uses the library membership from RTK Query cache (no extra fetch here).
 */
export function useRecentActivitySections(): {
  sections: RecentActivitySection[];
  loading: boolean;
} {
  const { events } = useRecentActivity();
  const isAuthenticated = useAppSelector((s) => s.auth.status === 'authenticated');

  const favourites = libraryApi.useGetFavouritesQuery(undefined, { skip: !isAuthenticated });
  const watchlist = libraryApi.useGetWatchlistQuery(undefined, { skip: !isAuthenticated });

  const owned = useMemo(() => {
    const ids = new Set<string>();
    for (const p of [favourites.data?.playlist, watchlist.data?.playlist]) {
      for (const item of p?.items ?? []) ids.add(item.imdbId);
    }
    return ids;
  }, [favourites.data, watchlist.data]);

  const sections = useMemo<RecentActivitySection[]>(() => {
    if (!isAuthenticated) return [];
    const out: RecentActivitySection[] = [];
    for (const event of events) {
      if (out.length >= RECENT_SECTIONS_MAX) break;
      if (event.type === 'search') {
        const q = event.query?.trim();
        if (!q) continue;
        out.push({
          event,
          title: `Because you searched for “${q}”`,
          kind: 'search',
          query: q,
        });
        continue;
      }
      const movie = event.movie;
      if (!movie) continue;
      if (owned.has(movie.imdbId)) continue;
      const genre = movie.genres?.[0];
      if (genre) {
        const verb =
          event.type === 'watchlist'
            ? 'added'
            : event.type === 'favourite'
              ? 'favourited'
              : 'viewed';
        out.push({
          event,
          title: `Because you ${verb} ${movie.title}`,
          kind: 'genre',
          query: genre,
        });
      } else if (movie.title) {
        out.push({
          event,
          title: `Because you ${event.type === 'watchlist' ? 'added' : event.type === 'favourite' ? 'favourited' : 'viewed'} ${movie.title}`,
          kind: 'search',
          query: movie.title,
        });
      }
    }
    return out;
  }, [events, owned, isAuthenticated]);

  return { sections, loading: favourites.isFetching || watchlist.isFetching };
}
