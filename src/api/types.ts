export interface FieldError {
  field: string;
  code: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details: FieldError[];
  };
  requestId: string | null;
}

export interface Envelope<T> {
  success: boolean;
  data: T;
  meta: Record<string, unknown>;
  requestId: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  twoFAEnabled: boolean;
}

export interface Credentials {
  user: AuthUser;
  accessToken: string;
  csrfToken: string;
}

export interface TwoFactorChallenge {
  requiresTwoFactor: true;
  challengeId: string;
  expiresInSeconds: number;
  delivery: { channel: 'email'; destination: string };
}

export type LoginResult = Credentials | TwoFactorChallenge;

export interface SessionInfo {
  id: string;
  device: string;
  ip: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  current: boolean;
}

export interface ProfileUser {
  id: string;
  name: string;
  bio: string;
  profilePic: string;
  coverPic: string;
}

export type PlaylistType = 'favourites' | 'watchlist' | 'custom';

export interface PlaylistItem {
  imdbId: string;
  title: string;
  posterUrl: string;
}

export interface Playlist {
  id: string;
  type: PlaylistType;
  name: string;
  description: string;
  isSystem: boolean;
  itemCount: number;
  items?: PlaylistItem[];
}

export interface LibrarySummary {
  favouritesCount: number;
  watchlistCount: number;
  customPlaylists: { id: string; name: string; itemCount: number }[];
}

export interface MovieSummary {
  imdbId: string;
  title: string;
  year: string;
  type: string;
  posterUrl: string;
  runtime?: string | null;
  genres?: string[];
  contentRating?: string | null;
  releaseDate?: string | null;
  imdbRating?: string | null;
  imdbVotes?: string | null;
  metascore?: string | null;
}

export interface MovieRating {
  source: string;
  value: string;
}

export interface MovieDetail extends MovieSummary {
  runtime: string | null;
  genres: string[];
  director: string | null;
  writers: string[];
  actors: string[];
  plot: string | null;
  languages: string[];
  countries: string[];
  contentRating: string | null;
  releaseDate: string | null;
  awards: string | null;
  ratings: MovieRating[];
  imdbRating: string | null;
  imdbVotes: string | null;
  metascore: string | null;
  boxOffice: string | null;
  totalSeasons: string | null;
}

export interface PaginatedMovies {
  movies: MovieSummary[];
  meta: {
    total: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

export interface RecentActivityMovie {
  imdbId: string;
  title: string;
  year?: string;
  posterUrl?: string;
  genres: string[];
}

export type RecentActivityType = 'search' | 'watchlist' | 'favourite' | 'view';

export interface RecentActivityEvent {
  id: string;
  type: RecentActivityType;
  at: number;
  query?: string;
  movie?: RecentActivityMovie;
}
