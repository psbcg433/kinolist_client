import Grid2 from '@mui/material/Grid2';
import { MovieCard } from './MovieCard';
import type { MovieSummary } from '../../api/types';

interface MovieGridProps {
  movies: MovieSummary[];
  footer?: (movie: MovieSummary) => React.ReactNode;
  columns?: { xs: number; sm: number; md: number; lg: number; xl: number };
}

const DEFAULT_COLUMNS = { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 };

/**
 * Responsive poster grid using MUI Grid2 (§1). Each cell spans one column;
 * total columns change per breakpoint so cards scale 2→4→6→8→10 across.
 */
export function MovieGrid({ movies, footer, columns = DEFAULT_COLUMNS }: MovieGridProps) {
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
          <MovieCard movie={movie} footer={footer ? footer(movie) : undefined} />
        </Grid2>
      ))}
    </Grid2>
  );
}
