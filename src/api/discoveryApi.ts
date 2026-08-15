import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import type { MovieSummary, PaginatedMovies } from './types';

export interface SearchArgs {
  q: string;
  page?: number;
  type?: 'movie' | 'series' | 'episode';
  year?: number;
  preview?: boolean;
  limit?: number;
}

function searchParams(args: string | SearchArgs) {
  if (typeof args === 'string') return { q: args };
  return args;
}

export const discoveryApi = createApi({
  reducerPath: 'discoveryApi',
  baseQuery,
  endpoints: (build) => ({
    search: build.query<PaginatedMovies, string | SearchArgs>({
      query: (args) => ({ url: '/search', params: searchParams(args) }),
    }),
    aiSearch: build.query<PaginatedMovies, Pick<SearchArgs, 'q' | 'type' | 'preview' | 'limit'>>({
      query: (args) => ({ url: '/search/ai', params: args }),
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
    topRatedFeed: build.query<PaginatedMovies, void>({
      query: () => '/feed/top-rated',
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
  useTopRatedFeedQuery,
  useRecommendLastSearchQuery,
  useRecommendSearchHistoryQuery,
  useRecommendFavouritesQuery,
  useRecommendWatchlistQuery,
} = discoveryApi;
