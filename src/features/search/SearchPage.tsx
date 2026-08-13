import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Pagination,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Alert,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useSearchParams } from 'react-router-dom';
import { useAiSearchQuery, useSearchQuery } from '../../api/discoveryApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { useAuth } from '../../hooks/useAuth';
import { MovieGrid } from '../../components/movie/MovieGrid';
import { EmptyState, LoadingState } from '../../components/state';
import { SEARCH_DEBOUNCE_MS } from '../../lib/constants';
import { usePageMeta } from '../../hooks/usePageMeta';

export default function SearchPage() {
  usePageMeta('Search');
  const [params] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [committedQuery, setCommittedQuery] = useState(initialQ);
  const [mode, setMode] = useState<'keyword' | 'ai'>('keyword');
  const [movieType, setMovieType] = useState<'all' | 'movie' | 'series'>('all');
  const [page, setPage] = useState(1);
  const { record } = useRecentActivity();
  const { isAuthenticated } = useAuth();

  const debounced = useDebounce(committedQuery, SEARCH_DEBOUNCE_MS);
  const keyword = useSearchQuery({ q: debounced, page, type: movieType === 'all' ? undefined : movieType }, {
    skip: !debounced || mode !== 'keyword',
  });
  const ai = useAiSearchQuery(debounced, {
    skip: !debounced || mode !== 'ai' || !isAuthenticated,
  });

  const active = mode === 'keyword' ? keyword : ai;
  const movies = active.data?.movies ?? [];
  const total = active.data?.meta?.total;
  const totalPages = active.data?.meta?.totalPages ?? 1;

  useEffect(() => {
    const next = params.get('q') ?? '';
    setQuery(next);
    setCommittedQuery(next);
    setPage(1);
  }, [params]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setCommittedQuery(q);
    setPage(1);
    if (mode === 'keyword') {
      record('search', { query: q });
    }
  };

  const handleModeChange = (_e: React.MouseEvent, next: 'keyword' | 'ai' | null) => {
    if (!next) return;
    setMode(next);
    setPage(1);
    if (query.trim()) {
      setCommittedQuery(query.trim());
    }
  };

  return (
    <Box>
      <Box sx={{ maxWidth: 760, mb: 4 }}>
        <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '.16em', fontWeight: 800 }}>
          Explore the catalogue
        </Typography>
        <Typography variant="h3" component="h1" sx={{ mt: 0.5 }}>
          Find your next watch
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Search by title or describe the mood, story, and style you want.
        </Typography>
      </Box>

      <Paper component="section" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
          <TextField
            placeholder="Try “slow-burn science fiction”"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
          />
          <Button type="submit" variant="contained" size="large">
            Search
          </Button>
          </Stack>
        </form>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} size="small">
          <ToggleButton value="keyword">Keyword</ToggleButton>
          <ToggleButton value="ai" disabled={!isAuthenticated}>AI natural language</ToggleButton>
        </ToggleButtonGroup>
        {mode === 'keyword' && (
          <ToggleButtonGroup
            value={movieType}
            exclusive
            onChange={(_event, next: 'all' | 'movie' | 'series' | null) => { if (next) { setMovieType(next); setPage(1); } }}
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="movie">Movies</ToggleButton>
            <ToggleButton value="series">Series</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>
      {mode === 'ai' && !isAuthenticated && (
        <Typography variant="caption" color="text.secondary">
          AI search requires signing in.
        </Typography>
      )}
      </Paper>

      {active.isError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {(active.error as { data?: { error?: { message?: string } } })?.data?.error?.message ??
            'Search failed. Please try again.'}
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        {active.isError ? null : !committedQuery ? (
          <EmptyState label="Type a query above to search" />
        ) : active.isLoading ? (
          <LoadingState />
        ) : movies.length === 0 && !active.isError ? (
          <EmptyState label="No results" />
        ) : (
          <>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {typeof total === 'number' ? `${total} result${total === 1 ? '' : 's'}` : `${movies.length} shown`}
              {mode === 'ai' && ' · AI'}
            </Typography>
            <MovieGrid movies={movies} />
            {mode === 'keyword' && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  page={page}
                  count={totalPages}
                  color="primary"
                  onChange={(_event, next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
