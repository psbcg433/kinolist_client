import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useGetMovieQuery } from '../../api/movieApi';
import { useGetFavouritesQuery, useGetWatchlistQuery, useListPlaylistsQuery } from '../../api/libraryApi';
import { usePlaylistActions } from '../../hooks/usePlaylistActions';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { MovieDetailSkeleton, ErrorState } from '../../components/state';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useAuth } from '../../hooks/useAuth';
import type { MovieSummary, Playlist } from '../../api/types';

export function AddToPlaylistDialog({
  open,
  movie,
  onClose,
}: {
  open: boolean;
  movie: MovieSummary | null;
  onClose: () => void;
}) {
  const { addTo } = usePlaylistActions();
  const { data: playlistsData } = useListPlaylistsQuery(undefined, { skip: !open });
  const playlists = playlistsData?.playlists ?? [];

  const handlePick = async (p: Playlist) => {
    if (!movie) return;
    await addTo(p.id, movie);
    onClose();
  };

  return (
    <Dialog open={open && !!movie} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add to playlist</DialogTitle>
      <DialogContent dividers>
        {playlists.length === 0 ? (
          <Typography color="text.secondary">No playlists yet — create one from your library.</Typography>
        ) : (
          <List dense disablePadding>
            {playlists.map((p) => (
              <ListItemButton key={p.id} onClick={() => handlePick(p)}>
                <ListItemText primary={p.name} secondary={p.isSystem ? p.type : `${p.itemCount} items`} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MovieDetailPage() {
  const { imdbId = '' } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetMovieQuery(imdbId);
  const { isAuthenticated } = useAuth();
  const { record } = useRecentActivity();
  const { addTo } = usePlaylistActions();
  const { data: favourites } = useGetFavouritesQuery(undefined, { skip: !isAuthenticated });
  const { data: watchlist } = useGetWatchlistQuery(undefined, { skip: !isAuthenticated });
  const [dialogMovie, setDialogMovie] = useState<MovieSummary | null>(null);

  const movie = data?.movie;

  useEffect(() => {
    if (movie) {
      record('view', {
        movie: {
          imdbId: movie.imdbId,
          title: movie.title,
          year: movie.year,
          posterUrl: movie.posterUrl,
          genres: movie.genres ?? [],
        },
      });
    }
  }, [movie, record]);

  usePageMeta(movie?.title ?? 'Movie');

  if (isLoading) return <MovieDetailSkeleton />;
  if (isError || !movie) {
    return (
      <ErrorState
        title="Could not load this movie"
        message={(error as { data?: { error?: { message?: string } } })?.data?.error?.message}
        onRetry={refetch}
      />
    );
  }

  const isFavourite = (favourites?.playlist?.items ?? []).some((i) => i.imdbId === movie.imdbId);
  const isWatchlist = (watchlist?.playlist?.items ?? []).some((i) => i.imdbId === movie.imdbId);
  const summary: MovieSummary = {
    imdbId: movie.imdbId,
    title: movie.title,
    year: movie.year,
    type: movie.type,
    posterUrl: movie.posterUrl,
  };

  const systemPlaylistId = (kind: 'favourites' | 'watchlist') =>
    kind === 'favourites' ? favourites?.playlist?.id : watchlist?.playlist?.id;

  const handleAddToSystem = async (kind: 'favourites' | 'watchlist') => {
    const id = systemPlaylistId(kind);
    if (id) await addTo(id, summary);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
      <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
        <img
          src={movie.posterUrl || undefined}
          alt={movie.title}
          style={{ width: '100%', borderRadius: 12, aspectRatio: '2/3', objectFit: 'cover' }}
        />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
          {movie.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {movie.year} · {movie.type}
          {movie.runtime ? ` · ${movie.runtime}` : ''}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {movie.genres.map((g) => (
            <Chip key={g} label={g} size="small" variant="outlined" />
          ))}
        </Box>

        {isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
            <Button
              variant={isFavourite ? 'outlined' : 'contained'}
              color="primary"
              disabled={isFavourite}
              onClick={() => handleAddToSystem('favourites')}
            >
              {isFavourite ? 'In favourites' : 'Add to favourites'}
            </Button>
            <Button
              variant={isWatchlist ? 'outlined' : 'contained'}
              color="secondary"
              disabled={isWatchlist}
              onClick={() => handleAddToSystem('watchlist')}
            >
              {isWatchlist ? 'In watchlist' : 'Add to watchlist'}
            </Button>
            <Button variant="outlined" onClick={() => setDialogMovie(summary)}>
              Add to playlist…
            </Button>
          </Box>
        )}

        {movie.plot && (
          <>
            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
              Plot
            </Typography>
            <Typography color="text.secondary">{movie.plot}</Typography>
          </>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mt: 3 }}>
          {movie.director && <Meta label="Director" value={movie.director} />}
          {movie.writers.length > 0 && <Meta label="Writers" value={movie.writers.join(', ')} />}
          {movie.actors.length > 0 && <Meta label="Cast" value={movie.actors.join(', ')} />}
          {movie.imdbRating && <Meta label="IMDb rating" value={movie.imdbRating} />}
          {movie.boxOffice && <Meta label="Box office" value={movie.boxOffice} />}
          {movie.languages.length > 0 && <Meta label="Languages" value={movie.languages.join(', ')} />}
          {movie.countries.length > 0 && <Meta label="Countries" value={movie.countries.join(', ')} />}
        </Box>
      </Box>

      <AddToPlaylistDialog open={!!dialogMovie} movie={dialogMovie} onClose={() => setDialogMovie(null)} />
    </Box>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
