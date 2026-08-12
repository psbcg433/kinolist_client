import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import type { MovieDetail } from './types';

export const movieApi = createApi({
  reducerPath: 'movieApi',
  baseQuery,
  tagTypes: ['Movie'],
  endpoints: (build) => ({
    getMovie: build.query<{ movie: MovieDetail }, string>({
      query: (imdbId) => `/movie/${imdbId}`,
      providesTags: (_result, _err, imdbId) => [{ type: 'Movie', id: imdbId }],
    }),
  }),
});

export const { useGetMovieQuery } = movieApi;
