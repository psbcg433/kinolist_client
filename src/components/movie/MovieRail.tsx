import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { MovieSummary } from '../../api/types';
import { MovieCard } from './MovieCard';

interface MovieRailProps {
  title: string;
  subtitle?: string;
  movies?: MovieSummary[];
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel?: string;
  action?: ReactNode;
  onRetry?: () => void;
}

export function MovieRail({
  title,
  subtitle,
  movies = [],
  isLoading = false,
  isError = false,
  emptyLabel = 'Nothing to show yet.',
  action,
  onRetry,
}: MovieRailProps) {
  return (
    <Box component="section" sx={{ mb: { xs: 4, md: 6 } }}>
      <Stack direction="row" alignItems="end" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" component="h2">{title}</Typography>
          {subtitle && <Typography color="text.secondary" variant="body2" sx={{ mt: 0.4 }}>{subtitle}</Typography>}
        </Box>
        {action}
      </Stack>

      {isLoading ? (
        <Box className="poster-rail" aria-label={`Loading ${title}`}>
          {Array.from({ length: 8 }, (_, index) => (
            <Box key={index}>
              <Skeleton variant="rounded" sx={{ width: '100%', aspectRatio: '2 / 3' }} />
              <Skeleton width="82%" sx={{ mt: 1 }} />
              <Skeleton width="42%" />
            </Box>
          ))}
        </Box>
      ) : isError ? (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 90, px: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography color="text.secondary">This row could not be loaded.</Typography>
          {onRetry && <Button size="small" onClick={onRetry}>Try again</Button>}
        </Stack>
      ) : movies.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 3 }}>{emptyLabel}</Typography>
      ) : (
        <Box className="poster-rail">
          {movies.map((movie) => <MovieCard key={movie.imdbId} movie={movie} />)}
        </Box>
      )}
    </Box>
  );
}
