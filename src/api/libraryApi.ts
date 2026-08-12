import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import type { LibrarySummary, Playlist, PlaylistItem } from './types';

export interface CreatePlaylistArgs {
  name: string;
  description?: string;
}

export interface UpdatePlaylistArgs {
  id: string;
  name?: string;
  description?: string;
}

export interface AddItemArgs {
  playlistId: string;
  item: PlaylistItem;
}

export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  baseQuery,
  tagTypes: ['Playlists', 'Summary'],
  endpoints: (build) => ({
    listPlaylists: build.query<{ playlists: Playlist[] }, void>({
      query: () => '/library/playlists',
      providesTags: ['Playlists'],
    }),
    createPlaylist: build.mutation<{ playlist: Playlist }, CreatePlaylistArgs>({
      query: (body) => ({ url: '/library/playlists', method: 'POST', body }),
      invalidatesTags: ['Playlists', 'Summary'],
    }),
    getPlaylist: build.query<{ playlist: Playlist }, string>({
      query: (playlistId) => `/library/playlists/${playlistId}`,
      providesTags: (_result, _err, id) => [{ type: 'Playlists', id }],
    }),
    updatePlaylist: build.mutation<{ playlist: Playlist }, UpdatePlaylistArgs>({
      query: ({ id, ...body }) => ({
        url: `/library/playlists/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Playlists', 'Summary'],
    }),
    deletePlaylist: build.mutation<{ deleted: true; playlistId: string }, string>({
      query: (id) => ({ url: `/library/playlists/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Playlists', 'Summary'],
    }),
    addItem: build.mutation<{ playlist: Playlist }, AddItemArgs>({
      query: ({ playlistId, item }) => ({
        url: `/library/playlists/${playlistId}/items`,
        method: 'POST',
        body: {
          imdbID: item.imdbId,
          title: item.title,
          posterUrl: item.posterUrl,
        },
      }),
      invalidatesTags: ['Playlists', 'Summary'],
    }),
    removeItem: build.mutation<{ playlist: Playlist }, { playlistId: string; imdbId: string }>({
      query: ({ playlistId, imdbId }) => ({
        url: `/library/playlists/${playlistId}/items/${imdbId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Playlists', 'Summary'],
    }),
    getFavourites: build.query<{ playlist: Playlist }, void>({
      query: () => '/library/favourites',
      providesTags: ['Playlists'],
    }),
    getWatchlist: build.query<{ playlist: Playlist }, void>({
      query: () => '/library/watchlist',
      providesTags: ['Playlists'],
    }),
    getSummary: build.query<{ summary: LibrarySummary }, void>({
      query: () => '/library/summary',
      providesTags: ['Summary'],
    }),
  }),
});

export const {
  useListPlaylistsQuery,
  useCreatePlaylistMutation,
  useGetPlaylistQuery,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useAddItemMutation,
  useRemoveItemMutation,
  useGetFavouritesQuery,
  useGetWatchlistQuery,
  useGetSummaryQuery,
} = libraryApi;
