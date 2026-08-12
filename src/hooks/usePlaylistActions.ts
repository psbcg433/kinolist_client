import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  useAddItemMutation,
  useRemoveItemMutation,
  useCreatePlaylistMutation,
  useListPlaylistsQuery,
} from '../api/libraryApi';
import { pushToast } from '../store/uiSlice';
import { useRecentActivity } from './useRecentActivity';
import type { MovieSummary, PlaylistItem } from '../api/types';

/**
 * Wraps libraryApi.addItem/removeItem with toast feedback, and (per §5.6)
 * records recent-activity events when items are added to watchlist/favourites.
 */
export function usePlaylistActions() {
  const dispatch = useAppDispatch();
  const [addItem] = useAddItemMutation();
  const [removeItem] = useRemoveItemMutation();
  const [createPlaylist] = useCreatePlaylistMutation();
  const { data: playlists } = useListPlaylistsQuery();
  const { record } = useRecentActivity();

  const addTo = useCallback(
    async (playlistId: string, movie: MovieSummary) => {
      const item: PlaylistItem = {
        imdbId: movie.imdbId,
        title: movie.title,
        posterUrl: movie.posterUrl,
      };
      const res = await addItem({ playlistId, item });
      if ('error' in res) {
        const msg = (res.error as { data?: { error?: { message?: string } } })?.data?.error?.message;
        dispatch(pushToast({ message: msg ?? 'Could not add to playlist', severity: 'error' }));
        return false;
      }
      const pl = playlists?.playlists?.find((p) => p.id === playlistId);
      const type = pl?.type ?? 'custom';
      if (type === 'watchlist' || type === 'favourites') {
        record(type === 'favourites' ? 'favourite' : 'watchlist', {
          movie: { ...item, genres: [] },
        });
      }
      dispatch(pushToast({ message: `Added “${movie.title}”`, severity: 'success' }));
      return true;
    },
    [addItem, playlists, dispatch, record]
  );

  const removeFrom = useCallback(
    async (playlistId: string, imdbId: string, title: string) => {
      const res = await removeItem({ playlistId, imdbId });
      if ('error' in res) {
        dispatch(pushToast({ message: 'Could not remove from playlist', severity: 'error' }));
        return false;
      }
      dispatch(pushToast({ message: `Removed “${title}”`, severity: 'info' }));
      return true;
    },
    [removeItem, dispatch]
  );

  const create = useCallback(
    async (name: string, description?: string) => {
      const res = await createPlaylist({ name, description });
      if ('error' in res) {
        const msg = (res.error as { data?: { error?: { message?: string } } })?.data?.error?.message;
        dispatch(pushToast({ message: msg ?? 'Could not create playlist', severity: 'error' }));
        return null;
      }
      dispatch(pushToast({ message: `Created “${name}”`, severity: 'success' }));
      return res.data?.playlist ?? null;
    },
    [createPlaylist, dispatch]
  );

  return { addTo, removeFrom, create };
}
