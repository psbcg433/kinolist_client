import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';
import { Link } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import type { MovieSummary } from '../../api/types';

interface MovieCardProps {
  movie: MovieSummary;
  footer?: ReactNode;
}

export function MovieCard({ movie, footer }: MovieCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [movie.posterUrl]);

  return (
    <Card
      sx={{
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .22s ease, border-color .22s ease, box-shadow .22s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: 'rgba(141,164,255,.48)',
          boxShadow: '0 18px 42px rgba(0,0,0,.38)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/movie/${movie.imdbId}`}
        aria-label={`View ${movie.title}`}
        sx={{ position: 'relative', flexGrow: 1 }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden', aspectRatio: '2 / 3', bgcolor: '#171e2a' }}>
          {movie.posterUrl && !imageFailed ? (
            <Box
              component="img"
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
              loading="lazy"
              onError={() => setImageFailed(true)}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s ease', '.MuiCard-root:hover &': { transform: 'scale(1.045)' } }}
            />
          ) : (
            <Box sx={{ display: 'grid', height: '100%', placeItems: 'center', color: 'text.disabled' }}>
              <ImageNotSupportedRoundedIcon fontSize="large" />
            </Box>
          )}
          {movie.type && (
            <Chip
              label={movie.type}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                height: 24,
                textTransform: 'capitalize',
                bgcolor: 'rgba(8,11,18,.78)',
                backdropFilter: 'blur(8px)',
              }}
            />
          )}
          <Box sx={{ position: 'absolute', inset: '55% 0 0', background: 'linear-gradient(transparent, rgba(8,11,18,.72))' }} />
        </Box>
        <CardContent sx={{ px: 1.5, py: 1.25, '&:last-child': { pb: 1.25 } }}>
          <Typography variant="body2" noWrap title={movie.title} sx={{ fontWeight: 750 }}>
            {movie.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {movie.year || 'Year unavailable'}
          </Typography>
        </CardContent>
      </CardActionArea>
      {footer}
    </Card>
  );
}
