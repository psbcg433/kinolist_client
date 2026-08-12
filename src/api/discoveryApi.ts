import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import type { MovieSummary, PaginatedMovies } from './types';

export const discoveryApi = createApi({
  reducerPath: 'discoveryApi',
  baseQuery,
  endpoints: (build) => ({
    search: build.query<PaginatedMovies, string>({
      query: (q) => ({ url: '/search', params: { q } }),
    }),
    aiSearch: build.query<PaginatedMovies, string>({
      query: (q) => ({ url: '/search/ai', params: { q } }),
    }),
    trendingFeed: build.query<PaginatedMovies, void>({
      query: () => '/feed/trending',
    }),
    genreFeed: build.query<PaginatedMovies, string>({
      query: (genre) => `/feed/genre/${genre}`,
    }),
    ongoingFeed: build.query<PaginatedMovies, void>({
      query: () => '/feed/ongoing',
    }),
    discoverFeed: build.query<PaginatedMovies, void>({
      query: () => '/feed/discover',
    }),
    recommendLastSearch: build.query<{ movies: MovieSummary[] }, string>({
      query: (userId) => `/recommend/last-search/${userId}`,
    }),
    recommendSearchHistory: build.query<{ movies: MovieSummary[] }, string>({
      query: (userId) => `/recommend/search-history/${userId}`,
    }),
    recommendFavourites: build.query<{ movies: MovieSummary[] }, string>({
      query: (userId) => `/recommend/favourites/${userId}`,
    }),
    recommendWatchlist: build.query<{ movies: MovieSummary[] }, string>({
      query: (userId) => `/recommend/watchlist/${userId}`,
    }),
  }),
});

export const {
  useSearchQuery,
  useAiSearchQuery,
  useTrendingFeedQuery,
  useGenreFeedQuery,
  useOngoingFeedQuery,
  useDiscoverFeedQuery,
  useRecommendLastSearchQuery,
  useRecommendSearchHistoryQuery,
  useRecommendFavouritesQuery,
  useRecommendWatchlistQuery,
} = discoveryApi;
