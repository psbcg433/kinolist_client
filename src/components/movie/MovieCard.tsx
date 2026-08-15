import { useEffect, useRef, useState } from 'react';
import { Box, Card, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Link, useLocation } from 'react-router-dom';
import type { MovieSummary } from '../../api/types';
import { useGetFavouritesQuery, useGetPlaylistQuery, useGetWatchlistQuery } from '../../api/libraryApi';
import { useGetMovieQuery } from '../../api/movieApi';
import { usePlaylistActions } from '../../hooks/usePlaylistActions';
import { MovieLibraryActions } from './MovieLibraryActions';

interface MovieCardProps {
  movie: MovieSummary;
  libraryActions?: boolean;
  removalPlaylist?: { id: string; name: string };
}

export function MovieCard({ movie, libraryActions = true, removalPlaylist }: MovieCardProps) {
  const { pathname } = useLocation();
  const customPlaylistMatch = pathname.match(/^\/library\/playlists\/([^/]+)\/?$/);
  const customPlaylistId = customPlaylistMatch?.[1] ? decodeURIComponent(customPlaylistMatch[1]) : '';
  const isFavouritesPage = /^\/library\/favourites\/?$/.test(pathname);
  const isWatchlistPage = /^\/library\/watchlist\/?$/.test(pathname);
  const isCollectionPage = isFavouritesPage || isWatchlistPage || Boolean(customPlaylistId);
  const favourites = useGetFavouritesQuery(undefined, { skip: !isFavouritesPage });
  const watchlist = useGetWatchlistQuery(undefined, { skip: !isWatchlistPage });
  const customPlaylist = useGetPlaylistQuery(customPlaylistId, { skip: !customPlaylistId });
  const routePlaylist = isFavouritesPage ? favourites.data?.playlist : isWatchlistPage ? watchlist.data?.playlist : customPlaylist.data?.playlist;
  const playlist = removalPlaylist ?? routePlaylist;
  const showRemoveAction = isCollectionPage || Boolean(removalPlaylist);
  const { removeFrom } = usePlaylistActions();
  const needsHydration = !movie.year || !movie.type || !movie.plot || !movie.genres?.length;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (!needsHydration) return;
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsNearViewport(true);
      observer.disconnect();
    }, { rootMargin: '600px 0px' });
    observer.observe(card);
    return () => observer.disconnect();
  }, [movie.imdbId, needsHydration]);

  const detail = useGetMovieQuery(movie.imdbId, { skip: !needsHydration || !isNearViewport });
  const displayMovie: MovieSummary = detail.data?.movie ?? movie;
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [displayMovie.posterUrl]);
  const genres = displayMovie.genres?.slice(0, 3) ?? [];

  return (
    <Card
      ref={cardRef}
      sx={{
        position: 'relative', height: '100%', minWidth: 0, p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        borderRadius: '26px', bgcolor: '#0c0a14',
        background: 'radial-gradient(circle at 82% 72%, rgba(120,55,210,.13), transparent 28%), linear-gradient(180deg, #11101b, #090810)',
        borderColor: 'rgba(190,145,255,.16)',
        transition: 'transform .25s ease, border-color .25s ease, box-shadow .25s ease',
        '&:hover': { transform: 'translateY(-7px)', borderColor: 'rgba(195,154,255,.5)', boxShadow: '0 22px 52px rgba(0,0,0,.5), 0 0 32px rgba(111,54,205,.12)' },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: '1 / 1.12', bgcolor: '#17121f', borderBottom: 1, borderColor: 'rgba(211,179,255,.16)' }}>
        <Box component={Link} to={`/movie/${displayMovie.imdbId}`} aria-label={`View ${displayMovie.title}`} sx={{ position: 'absolute', inset: 0, display: 'block' }}>
          {displayMovie.posterUrl && !imageFailed ? (
            <Box component="img" src={displayMovie.posterUrl} alt={`${displayMovie.title} poster`} loading="lazy" decoding="async" onError={() => setImageFailed(true)} sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', transition: 'transform .45s ease', '.MuiCard-root:hover &': { transform: 'scale(1.045)' } }} />
          ) : (
            <Box sx={{ display: 'grid', height: '100%', placeItems: 'center', color: 'text.disabled' }}><ImageNotSupportedRoundedIcon fontSize="large" /></Box>
          )}
          <Box sx={{ position: 'absolute', inset: '54% 0 0', background: 'linear-gradient(transparent, rgba(9,8,16,.88))' }} />
        </Box>
        {displayMovie.type && (
          <Chip label={displayMovie.type} size="small" variant="outlined" sx={{ position: 'absolute', top: 18, left: 18, height: 32, px: .65, textTransform: 'uppercase', letterSpacing: '.1em', fontSize: '.68rem', fontWeight: 850, color: 'primary.light', bgcolor: 'rgba(10,8,18,.72)', borderColor: 'rgba(189,134,255,.68)', backdropFilter: 'blur(10px)', pointerEvents: 'none' }} />
        )}
        {displayMovie.imdbRating && (
          <Chip icon={<StarRoundedIcon sx={{ color: '#ffc857 !important' }} />} label={displayMovie.imdbRating} size="small" sx={{ position: 'absolute', top: 18, right: 18, height: 34, px: .45, bgcolor: 'rgba(8,7,14,.88)', backdropFilter: 'blur(10px)', fontWeight: 850, pointerEvents: 'none' }} />
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 205, px: { xs: 2, md: 2.2 }, pt: 1.9, pb: 1.9 }}>
        <Box component={Link} to={`/movie/${displayMovie.imdbId}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
          <Typography variant="h6" component="h3" title={displayMovie.title} sx={{ fontSize: '1.15rem', lineHeight: 1.2, fontWeight: 850, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>{displayMovie.title}</Typography>
          {genres.length > 0 && <Typography variant="overline" color="primary.light" sx={{ display: 'block', mt: .8, fontSize: '.68rem', lineHeight: 1.45, fontWeight: 850, letterSpacing: '.13em' }}>{genres.join('  ·  ')}</Typography>}
          {displayMovie.plot && <Typography variant="body2" color="text.secondary" sx={{ mt: 1.15, lineHeight: 1.52, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>{displayMovie.plot}</Typography>}
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={1.5} sx={{ mt: 'auto', pt: displayMovie.plot ? 1.7 : 2.35 }}>
          <Stack spacing={.8} sx={{ minWidth: 0 }}>
            {displayMovie.year && <Stack direction="row" spacing={.65} alignItems="center"><Box sx={{ display: 'grid', placeItems: 'center', width: 25, height: 25, borderRadius: 1, bgcolor: 'rgba(146,84,255,.11)', color: 'primary.light' }}><CalendarMonthRoundedIcon sx={{ fontSize: 15 }} /></Box><Typography variant="caption" color="text.secondary">{displayMovie.year}</Typography></Stack>}
            <Stack direction="row" spacing={.7} alignItems="center" flexWrap="wrap" useFlexGap>
              {displayMovie.runtime && <Typography variant="caption" color="text.secondary">{displayMovie.runtime}</Typography>}
              {displayMovie.contentRating && <Chip label={displayMovie.contentRating} size="small" variant="outlined" sx={{ height: 21, fontSize: '.62rem', color: 'primary.light', borderColor: 'rgba(190,145,255,.35)' }} />}
            </Stack>
          </Stack>
          {showRemoveAction ? (
            <Tooltip title={`Remove from ${playlist?.name || 'collection'}`}>
              <span>
                <IconButton
                  aria-label={`Remove ${displayMovie.title} from ${playlist?.name || 'collection'}`}
                  disabled={!playlist}
                  onClick={() => playlist && removeFrom(playlist.id, displayMovie.imdbId, displayMovie.title)}
                  sx={{ width: 42, height: 42, color: 'error.light', bgcolor: 'rgba(244,67,54,.08)', border: 1, borderColor: 'rgba(244,67,54,.35)', '&:hover': { bgcolor: 'rgba(244,67,54,.18)', borderColor: 'error.main' } }}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>
          ) : libraryActions ? <MovieLibraryActions movie={displayMovie} variant="card" /> : null}
        </Stack>
      </Box>
    </Card>
  );
}
