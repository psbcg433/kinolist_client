import Grid2 from '@mui/material/Grid2';
import { MovieCard } from './MovieCard';
import type { MovieSummary } from '../../api/types';

interface MovieGridProps {
  movies: MovieSummary[];
  columns?: { xs: number; sm: number; md: number; lg: number; xl: number };
}

const DEFAULT_COLUMNS = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 };

/**
 * Responsive poster grid using MUI Grid2 (§1). Each cell spans one column;
 * Cards stay intentionally generous so their metadata and library controls remain usable.
 */
export function MovieGrid({ movies, columns = DEFAULT_COLUMNS }: MovieGridProps) {
  return (
    <Grid2
      container
      spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
      columns={{ xs: columns.xs, sm: columns.sm, md: columns.md, lg: columns.lg, xl: columns.xl }}
    >
      {movies.map((movie) => (
        <Grid2
          size={{
            xs: 1,
            sm: 1,
            md: 1,
            lg: 1,
            xl: 1,
          }}
          key={movie.imdbId}
        >
          <MovieCard movie={movie} />
        </Grid2>
      ))}
    </Grid2>
  );
}
