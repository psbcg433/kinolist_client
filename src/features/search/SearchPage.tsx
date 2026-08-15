import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Pagination,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Link, useSearchParams } from 'react-router-dom';
import { useAiSearchQuery, useSearchQuery } from '../../api/discoveryApi';
import type { MovieSummary, RecentActivityEvent, RecentActivityMovie } from '../../api/types';
import { MovieGrid } from '../../components/movie/MovieGrid';
import { LoadingState } from '../../components/state';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { SEARCH_DEBOUNCE_MS } from '../../lib/constants';

type SearchMode = 'keyword' | 'ai';
type MovieType = 'all' | 'movie' | 'series';

function asRecentMovie(movie: MovieSummary): RecentActivityMovie {
  return {
    imdbId: movie.imdbId,
    title: movie.title,
    year: movie.year,
    posterUrl: movie.posterUrl,
    genres: movie.genres ?? [],
    type: movie.type,
    imdbRating: movie.imdbRating ?? undefined,
  };
}

function Poster({ movie, height }: { movie: RecentActivityMovie | MovieSummary; height: number | object }) {
  return (
    <Box sx={{ position: 'relative', height, bgcolor: 'rgba(146,84,255,.13)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      <Typography color="primary.light" fontWeight={900}>{movie.title.charAt(0)}</Typography>
      {movie.posterUrl && (
        <Box component="img" src={movie.posterUrl} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
      )}
    </Box>
  );
}

function RecentSearchCard({ event, onResolve }: { event: RecentActivityEvent; onResolve: (query: string, movie: MovieSummary) => void }) {
  const query = event.query?.trim() ?? '';
  const lookup = useSearchQuery({ q: query, page: 1, preview: true }, { skip: Boolean(event.movie) || !query });
  const fetchedMovie = lookup.data?.movies?.[0];
  const movie = event.movie ?? fetchedMovie;

  useEffect(() => {
    if (query && fetchedMovie) onResolve(query, fetchedMovie);
  }, [fetchedMovie?.imdbId, onResolve, query]);

  if (!movie) return lookup.isLoading ? <Skeleton variant="rounded" height={242} /> : null;
  return (
    <Card component={Link} to={`/movie/${movie.imdbId}`} sx={{ position: 'relative', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '88px minmax(0, 1fr)', lg: '1fr' }, overflow: 'hidden', color: 'inherit', textDecoration: 'none', bgcolor: '#0d0b16', transition: 'transform .2s ease, border-color .2s ease', '&:hover': { transform: 'translateY(-4px)', borderColor: 'primary.main' } }}>
      <Box sx={{ position: 'relative' }}>
        <Poster movie={movie} height={{ xs: 150, sm: 128, lg: 178 }} />
        {query && <Chip label={query} size="small" sx={{ position: 'absolute', left: 8, bottom: 8, maxWidth: 'calc(100% - 16px)', height: 23, bgcolor: 'rgba(7,7,17,.86)', backdropFilter: 'blur(8px)', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />}
      </Box>
      <Box sx={{ p: 1.25, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={850} noWrap>{movie.title}</Typography>
        <Stack direction="row" spacing={.7} alignItems="center" sx={{ mt: .45 }}>
          <Typography variant="caption" color="text.secondary">{movie.year || movie.type}</Typography>
          {movie.imdbRating && <Typography variant="caption" color="#ffc857" sx={{ display: 'flex', alignItems: 'center', gap: .25 }}><StarRoundedIcon sx={{ fontSize: 13 }} />{movie.imdbRating}</Typography>}
        </Stack>
      </Box>
    </Card>
  );
}

function LiveSuggestions({ movies, loading, query, onChoose }: { movies: MovieSummary[]; loading: boolean; query: string; onChoose: (movie: MovieSummary) => void }) {
  if (loading) {
    return <Stack spacing={1} sx={{ mt: 2 }}>{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} variant="rounded" height={76} />)}</Stack>;
  }
  if (movies.length === 0) return null;
  return (
    <Paper component="section" aria-label="Live search suggestions" variant="outlined" sx={{ mt: 2, p: 1, borderRadius: 2.5, bgcolor: 'rgba(12,10,22,.96)', borderColor: 'rgba(190,145,255,.22)' }}>
      <Stack direction="row" alignItems="center" spacing={.75} sx={{ px: 1, py: .7 }}>
        <SearchRoundedIcon color="primary" sx={{ fontSize: 18 }} />
        <Typography variant="caption" color="text.secondary">Suggestions for “{query}”</Typography>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: .75 }}>
        {movies.slice(0, 5).map((movie) => (
          <Box key={movie.imdbId} component={Link} to={`/movie/${movie.imdbId}`} onClick={() => onChoose(movie)} sx={{ display: 'grid', gridTemplateColumns: '52px minmax(0, 1fr) auto', alignItems: 'center', gap: 1.15, p: .75, borderRadius: 2, color: 'inherit', textDecoration: 'none', transition: 'background-color .18s ease, transform .18s ease', '&:hover': { bgcolor: 'rgba(146,84,255,.11)', transform: 'translateX(2px)' } }}>
            <Box sx={{ borderRadius: 1.2, overflow: 'hidden' }}><Poster movie={movie} height={66} /></Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={850} noWrap>{movie.title}</Typography>
              <Typography variant="caption" color="text.secondary">{[movie.year, movie.type].filter(Boolean).join(' · ')}</Typography>
            </Box>
            {movie.imdbRating && <Chip icon={<StarRoundedIcon sx={{ color: '#ffc857 !important' }} />} label={movie.imdbRating} size="small" sx={{ bgcolor: 'rgba(7,7,17,.75)' }} />}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export default function SearchPage() {
  usePageMeta('Search');
  const [params] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [committedQuery, setCommittedQuery] = useState(initialQ);
  const [mode, setMode] = useState<SearchMode>('keyword');
  const [movieType, setMovieType] = useState<MovieType>('all');
  const [page, setPage] = useState(1);
  const { events, record } = useRecentActivity();
  const { isAuthenticated } = useAuth();

  const trimmedQuery = query.trim();
  const suggestionMinLength = 3;
  const debouncedDraft = useDebounce(trimmedQuery, Math.max(SEARCH_DEBOUNCE_MS, 650));
  const previewReady = trimmedQuery.length >= suggestionMinLength
    && trimmedQuery !== committedQuery
    && debouncedDraft === trimmedQuery;
  const type = movieType === 'all' ? undefined : movieType;

  const keyword = useSearchQuery({ q: committedQuery, page, type }, { skip: !committedQuery || mode !== 'keyword' });
  const ai = useAiSearchQuery({ q: committedQuery, type }, { skip: !committedQuery || mode !== 'ai' || !isAuthenticated });
  const aiPreview = useAiSearchQuery({ q: debouncedDraft, type, preview: true, limit: 5 }, { skip: !previewReady || !isAuthenticated });

  const active = mode === 'keyword' ? keyword : ai;
  const movies = active.data?.movies ?? [];
  const suggestions = aiPreview.data?.movies?.slice(0, 5) ?? [];
  const total = active.data?.meta?.total;
  const totalPages = active.data?.meta?.totalPages ?? 1;
  const firstResult = movies[0];
  const isDrafting = trimmedQuery.length > 0 && trimmedQuery !== committedQuery;

  const recentSearches = useMemo(() => {
    const seen = new Set<string>();
    return events.filter((event) => event.type === 'search' && event.query?.trim()).filter((event) => {
      const key = event.movie?.imdbId || event.query!.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);
  }, [events]);

  const rememberMovie = useCallback((searchQuery: string, movie: MovieSummary) => {
    record('search', { query: searchQuery, movie: asRecentMovie(movie) });
  }, [record]);

  useEffect(() => {
    const next = params.get('q') ?? '';
    setQuery(next);
    setCommittedQuery(next);
    setPage(1);
  }, [params]);

  useEffect(() => {
    if (committedQuery && firstResult) rememberMovie(committedQuery, firstResult);
  }, [committedQuery, firstResult?.imdbId, rememberMovie]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmedQuery) return;
    setCommittedQuery(trimmedQuery);
    setPage(1);
    record('search', { query: trimmedQuery });
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setCommittedQuery('');
      setPage(1);
    }
  };

  const showRecent = !trimmedQuery && !committedQuery && recentSearches.length > 0;
  const showPreviewLoading = isAuthenticated && isDrafting && trimmedQuery.length >= suggestionMinLength && (!previewReady || aiPreview.isLoading || aiPreview.isFetching);

  return (
    <Box>
      <Box sx={{ maxWidth: 760, mb: 4 }}>
        <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '.16em', fontWeight: 800 }}>Explore the catalogue</Typography>
        <Typography variant="h3" component="h1" sx={{ mt: .5 }}>Find your next watch</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Search by title or describe the mood, story, and style you want.</Typography>
      </Box>

      <Paper component="section" sx={{ p: { xs: 1.5, md: 2.25 }, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden', borderRadius: 2.5, bgcolor: 'rgba(7,7,17,.52)', borderColor: 'rgba(190,145,255,.28)', transition: 'border-color .2s ease, box-shadow .2s ease', '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 3px rgba(146,84,255,.1)' } }}>
            <TextField
              placeholder={mode === 'ai' ? 'Describe a mood, story, or style…' : 'Search movies and series…'}
              fullWidth variant="standard" value={query} onChange={(event) => handleQueryChange(event.target.value)}
              sx={{ flexGrow: 1, px: { xs: 1.25, sm: 1.7 }, py: .7, '& .MuiInput-root': { height: 48 }, '& .MuiInput-root:before, & .MuiInput-root:after': { display: 'none' } }}
              slotProps={{ input: { disableUnderline: true, startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment> } }}
            />
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(190,145,255,.2)' }} />
            <ToggleButton value="ai" selected={mode === 'ai'} disabled={!isAuthenticated} onChange={() => { setMode((current) => current === 'ai' ? 'keyword' : 'ai'); setPage(1); }} aria-label="Toggle AI search" sx={{ flexShrink: 0, minWidth: { xs: 52, sm: 92 }, border: 0, borderRadius: 0, gap: .65, color: 'text.secondary', '&.Mui-selected': { color: 'primary.light', bgcolor: 'rgba(146,84,255,.16)' } }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 19 }} /><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, fontWeight: 850 }}>AI</Box>
            </ToggleButton>
            <Button type="submit" variant="contained" disableElevation aria-label="Search" sx={{ flexShrink: 0, minWidth: { xs: 54, sm: 126 }, borderRadius: 0, px: { xs: 0, sm: 2.5 }, gap: .7 }}>
              <SearchRoundedIcon sx={{ display: { xs: 'block', sm: 'none' } }} /><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Search</Box>
            </Button>
          </Paper>
        </form>

        {isAuthenticated && isDrafting && trimmedQuery.length >= suggestionMinLength && (
          <LiveSuggestions movies={suggestions} loading={showPreviewLoading} query={debouncedDraft || trimmedQuery} onChoose={(movie) => rememberMovie(trimmedQuery, movie)} />
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }} sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 750 }}>Show</Typography>
          <ToggleButtonGroup value={movieType} exclusive onChange={(_event, next: MovieType | null) => { if (next) { setMovieType(next); setPage(1); } }} size="small">
            <ToggleButton value="all">All</ToggleButton><ToggleButton value="movie">Movies</ToggleButton><ToggleButton value="series">Series</ToggleButton>
          </ToggleButtonGroup>
          {!isAuthenticated && <Typography variant="caption" color="text.secondary">Sign in to activate AI search.</Typography>}
          {mode === 'ai' && <Chip icon={<AutoAwesomeRoundedIcon />} label="AI natural-language mode" size="small" color="primary" variant="outlined" sx={{ ml: { sm: 'auto' } }} />}
        </Stack>

      </Paper>

      {showRecent && (
        <Box component="section" sx={{ mt: 3.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><HistoryRoundedIcon color="primary" /><Box><Typography variant="h6" component="h2">Recently searched films</Typography><Typography variant="caption" color="text.secondary">Your latest discoveries</Typography></Box></Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' }, gap: { xs: 1.25, md: 1.75 } }}>
            {recentSearches.map((event) => <RecentSearchCard key={event.id} event={event} onResolve={rememberMovie} />)}
          </Box>
        </Box>
      )}

      {!isDrafting && active.isError && <Alert severity="warning" sx={{ mt: 2 }}>{(active.error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'Search failed. Please try again.'}</Alert>}

      {!isDrafting && committedQuery && (
        <Box sx={{ mt: 3 }}>
          {active.isLoading ? <LoadingState /> : movies.length === 0 || active.isError ? null : (
            <>
              <Typography color="text.secondary" sx={{ mb: 2 }}>{typeof total === 'number' ? `${total} result${total === 1 ? '' : 's'}` : `${movies.length} shown`}{mode === 'ai' && ' · AI'}</Typography>
              <MovieGrid movies={movies} />
              {mode === 'keyword' && totalPages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><Pagination page={page} count={totalPages} color="primary" onChange={(_event, next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></Box>}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
