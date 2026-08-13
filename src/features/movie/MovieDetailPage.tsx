import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BookmarkAddRoundedIcon from '@mui/icons-material/BookmarkAddRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
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
  const { addTo, create } = usePlaylistActions();
  const { data: playlistsData } = useListPlaylistsQuery(undefined, { skip: !open });
  const playlists = playlistsData?.playlists ?? [];
  const customPlaylists = playlists.filter((playlist) => !playlist.isSystem);
  const [newName, setNewName] = useState('');

  const handlePick = async (p: Playlist) => {
    if (!movie) return;
    await addTo(p.id, movie);
    onClose();
  };

  const handleCreateAndAdd = async () => {
    if (!movie || !newName.trim()) return;
    const playlist = await create(newName.trim());
    if (!playlist) return;
    await addTo(playlist.id, movie);
    setNewName('');
    onClose();
  };

  return (
    <Dialog open={open && !!movie} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add to playlist</DialogTitle>
      <DialogContent dividers>
        {customPlaylists.length === 0 ? <Typography color="text.secondary">No custom playlists yet.</Typography> : (
          <List dense disablePadding>
            {customPlaylists.map((p) => (
              <ListItemButton key={p.id} onClick={() => handlePick(p)}>
                <ListItemText primary={p.name} secondary={p.isSystem ? p.type : `${p.itemCount} items`} />
              </ListItemButton>
            ))}
          </List>
        )}
        <Divider sx={{ my: 2 }}>or create one</Divider>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField size="small" label="Playlist name" value={newName} onChange={(event) => setNewName(event.target.value)} fullWidth inputProps={{ maxLength: 80 }} />
          <Button variant="contained" onClick={handleCreateAndAdd} disabled={!newName.trim()} sx={{ whiteSpace: 'nowrap' }}>Create & add</Button>
        </Stack>
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
    runtime: movie.runtime,
    genres: movie.genres,
    contentRating: movie.contentRating,
    releaseDate: movie.releaseDate,
    imdbRating: movie.imdbRating,
    imdbVotes: movie.imdbVotes,
    metascore: movie.metascore,
  };

  const systemPlaylistId = (kind: 'favourites' | 'watchlist') =>
    kind === 'favourites' ? favourites?.playlist?.id : watchlist?.playlist?.id;

  const handleAddToSystem = async (kind: 'favourites' | 'watchlist') => {
    const id = systemPlaylistId(kind);
    if (id) await addTo(id, summary);
  };

  return (
    <Box>
      <Box sx={{ position: 'relative', overflow: 'hidden', mb: 3, p: { xs: 2, sm: 3, lg: 4 }, border: 1, borderColor: 'divider', borderRadius: 3, background: movie.posterUrl ? `linear-gradient(90deg, rgba(7,7,17,.96), rgba(7,7,17,.86) 55%, rgba(7,7,17,.46)), url("${movie.posterUrl}") right 24% center / min(48vw, 650px) auto no-repeat` : 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2.5, md: 4 }, alignItems: { sm: 'flex-end' } }}>
          <Box component="img" src={movie.posterUrl || undefined} alt={movie.title} sx={{ width: { xs: '58%', sm: 220, lg: 260 }, maxWidth: 280, alignSelf: { xs: 'center', sm: 'auto' }, borderRadius: 2, aspectRatio: '2/3', objectFit: 'cover', boxShadow: '0 24px 50px rgba(0,0,0,.52)' }} />
          <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1, pb: { md: 1 } }}>
            <Typography variant="overline" color="primary.light" fontWeight={900} letterSpacing=".14em">{movie.type}</Typography>
            <Typography variant="h2" component="h1" sx={{ mt: .3, maxWidth: 850, fontSize: { xs: '2.2rem', md: '3.5rem' } }}>{movie.title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 1.5 }}>
              {[movie.year, movie.contentRating, movie.runtime, movie.totalSeasons ? `${movie.totalSeasons} seasons` : null].filter(Boolean).join(' · ')}
            </Typography>
            <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>{movie.genres.map((g) => <Chip key={g} label={g} size="small" variant="outlined" />)}</Stack>

            {isAuthenticated && (
              <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
            <Button
              variant={isFavourite ? 'outlined' : 'contained'}
              color="primary"
              startIcon={<FavoriteRoundedIcon />}
              disabled={isFavourite}
              onClick={() => handleAddToSystem('favourites')}
            >
              {isFavourite ? 'In favourites' : 'Favourite'}
            </Button>
            <Button
              variant={isWatchlist ? 'outlined' : 'contained'}
              color="secondary"
              startIcon={<BookmarkAddRoundedIcon />}
              disabled={isWatchlist}
              onClick={() => handleAddToSystem('watchlist')}
            >
              {isWatchlist ? 'In watchlist' : 'Watch later'}
            </Button>
            <Button variant="outlined" onClick={() => setDialogMovie(summary)}>
              Add to collection
            </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="stretch">
        <Card sx={{ p: { xs: 2.5, md: 3 }, flex: 1 }}>
          <Typography variant="h5">Storyline</Typography>
          <Typography color="text.secondary" sx={{ mt: 1.2, lineHeight: 1.8 }}>{movie.plot || 'No plot summary is available for this title.'}</Typography>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 2.5 }}>
          {movie.director && <Meta label="Director" value={movie.director} />}
          {movie.writers.length > 0 && <Meta label="Writers" value={movie.writers.join(', ')} />}
          {movie.actors.length > 0 && <Meta label="Cast" value={movie.actors.join(', ')} />}
          {movie.imdbRating && <Meta label="IMDb rating" value={movie.imdbRating} />}
          {movie.boxOffice && <Meta label="Box office" value={movie.boxOffice} />}
          {movie.languages.length > 0 && <Meta label="Languages" value={movie.languages.join(', ')} />}
          {movie.countries.length > 0 && <Meta label="Countries" value={movie.countries.join(', ')} />}
          {movie.releaseDate && <Meta label="Released" value={movie.releaseDate} />}
          </Box>
        </Card>

        <Box sx={{ width: { xs: '100%', lg: 350 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            <ScoreCard icon={<StarRoundedIcon />} label="IMDb" value={movie.imdbRating ? `${movie.imdbRating}/10` : '—'} detail={movie.imdbVotes ? `${movie.imdbVotes} votes` : undefined} />
            <ScoreCard icon={<AutoAwesomeRoundedIcon />} label="Metascore" value={movie.metascore ?? '—'} detail="Critic score" />
          </Box>
          {movie.ratings.length > 0 && <Card sx={{ p: 2.25 }}><Typography variant="subtitle2" sx={{ mb: 1.5 }}>Ratings</Typography>{movie.ratings.map((rating) => <Stack key={rating.source} direction="row" justifyContent="space-between" spacing={2} sx={{ py: .7 }}><Typography variant="body2" color="text.secondary">{rating.source}</Typography><Typography variant="body2" fontWeight={850}>{rating.value}</Typography></Stack>)}</Card>}
          {movie.awards && <Card sx={{ p: 2.25, background: 'linear-gradient(145deg, rgba(255,200,87,.1), #100e1d)' }}><Stack direction="row" spacing={1.5}><EmojiEventsRoundedIcon sx={{ color: '#ffc857' }} /><Box><Typography variant="subtitle2">Awards</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{movie.awards}</Typography></Box></Stack></Card>}
        </Box>
      </Stack>

      <AddToPlaylistDialog open={!!dialogMovie} movie={dialogMovie} onClose={() => setDialogMovie(null)} />
    </Box>
  );
}

function ScoreCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail?: string }) {
  return (
    <Card sx={{ p: 2, minWidth: 0 }}>
      <Box sx={{ color: '#ffc857', mb: 1 }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6">{value}</Typography>
      {detail && <Typography variant="caption" color="text.secondary" noWrap display="block">{detail}</Typography>}
    </Card>
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
