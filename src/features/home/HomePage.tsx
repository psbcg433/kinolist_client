import { Box, Button, Chip, Skeleton, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Link } from 'react-router-dom';
import {
  useDiscoverFeedQuery,
  useGenreFeedQuery,
  useOngoingFeedQuery,
  useSearchQuery,
  useTrendingFeedQuery,
} from '../../api/discoveryApi';
import type { MovieSummary } from '../../api/types';
import { MovieRail } from '../../components/movie/MovieRail';
import { useAuth } from '../../hooks/useAuth';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useRecentActivitySections } from '../../hooks/useRecentActivitySections';
import { GENRES } from '../../lib/constants';

function RecentRail({ title, query, kind }: { title: string; query: string; kind: 'search' | 'genre' }) {
  const search = useSearchQuery(query, { skip: kind !== 'search' });
  const genre = useGenreFeedQuery(query, { skip: kind !== 'genre' });
  const result = kind === 'search' ? search : genre;

  return (
    <MovieRail
      title={title}
      subtitle="Inspired by your recent activity"
      movies={result.data?.movies}
      isLoading={result.isLoading}
      isError={result.isError}
      onRetry={result.refetch}
    />
  );
}

function Hero({ movie, isLoading, isAuthenticated }: { movie?: MovieSummary; isLoading: boolean; isAuthenticated: boolean }) {
  if (isAuthenticated && isLoading) {
    return <Skeleton variant="rounded" height={440} sx={{ mb: { xs: 4, md: 6 }, borderRadius: 4 }} />;
  }

  const title = movie?.title ?? 'Your next favourite is waiting.';
  const eyebrow = movie ? `${movie.year} · ${movie.type}` : 'DISCOVER · TRACK · SHARE';
  const backdrop = movie?.posterUrl;

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: 390, md: 470 },
        mb: { xs: 4, md: 6 },
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        border: 1,
        borderColor: 'divider',
        borderRadius: { xs: 3, md: 4 },
        backgroundColor: '#101622',
        backgroundImage: backdrop
          ? `linear-gradient(90deg, rgba(8,11,18,.98) 0%, rgba(8,11,18,.82) 43%, rgba(8,11,18,.18) 78%), linear-gradient(0deg, rgba(8,11,18,.92), transparent 55%), url("${backdrop}")`
          : 'radial-gradient(circle at 78% 24%, rgba(229,9,20,.32), transparent 32%), radial-gradient(circle at 65% 60%, rgba(91,124,250,.34), transparent 38%), linear-gradient(135deg, #111827, #080b12)',
        backgroundSize: backdrop ? 'cover' : 'auto',
        backgroundPosition: backdrop ? 'center 24%' : 'center',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, width: { xs: '100%', md: '62%' }, p: { xs: 3, sm: 4, md: 6 } }}>
        <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '.18em', fontWeight: 800 }}>
          {eyebrow}
        </Typography>
        <Typography variant="h2" component="h1" sx={{ mt: 1, fontSize: { xs: '2.45rem', sm: '3.4rem', md: '4.4rem' }, lineHeight: 1.02 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 560, fontSize: { md: '1.05rem' } }}>
          {movie
            ? 'Explore the details, save it to your library, and keep building a watchlist that feels entirely yours.'
            : 'Search films and series, build precise watchlists, and get recommendations shaped by what you actually enjoy.'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3, alignItems: { xs: 'stretch', sm: 'center' } }}>
          <Button
            component={Link}
            to={movie ? `/movie/${movie.imdbId}` : '/search'}
            variant="contained"
            size="large"
            startIcon={movie ? <PlayArrowRoundedIcon /> : <SearchRoundedIcon />}
          >
            {movie ? 'View details' : 'Find something to watch'}
          </Button>
          {!isAuthenticated && (
            <Button component={Link} to="/register" color="inherit" size="large" endIcon={<ArrowForwardRoundedIcon />}>
              Create a free account
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default function HomePage() {
  usePageMeta('Discover movies and series');
  const { isAuthenticated } = useAuth();
  const { sections } = useRecentActivitySections();
  const trending = useTrendingFeedQuery(undefined, { skip: !isAuthenticated });
  const ongoing = useOngoingFeedQuery(undefined, { skip: !isAuthenticated });
  const discover = useDiscoverFeedQuery(undefined, { skip: !isAuthenticated });
  const heroMovie = discover.data?.movies?.[0];

  return (
    <Box>
      <Hero movie={heroMovie} isLoading={discover.isLoading} isAuthenticated={isAuthenticated} />

      <Box component="section" sx={{ mb: { xs: 4, md: 5 } }}>
        <Stack direction="row" alignItems="end" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h2">Explore by genre</Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.4 }}>Jump straight into a mood.</Typography>
          </Box>
          <Button component={Link} to="/search" size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ display: { xs: 'none', sm: 'inline-flex' }, whiteSpace: 'nowrap' }}>All search</Button>
        </Stack>
        <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
          {GENRES.slice(0, 12).map((genre) => (
            <Chip key={genre} label={genre} component={Link} to={`/search?q=${encodeURIComponent(genre)}`} clickable variant="outlined" sx={{ textTransform: 'capitalize' }} />
          ))}
        </Stack>
      </Box>

      {!isAuthenticated ? (
        <Box sx={{ p: { xs: 3, md: 4 }, border: 1, borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h5">Make KinoList yours</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5, maxWidth: 660 }}>
            Sign in to unlock live discovery feeds, personalised rows, favourites, watchlists, and custom playlists.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button component={Link} to="/login" variant="contained">Sign in</Button>
            <Button component={Link} to="/register" variant="outlined">Join free</Button>
          </Stack>
        </Box>
      ) : (
        <>
          {sections.map((section) => (
            <RecentRail key={`${section.event.id}-${section.query}`} title={section.title} query={section.query} kind={section.kind} />
          ))}
          <MovieRail title="Trending now" subtitle="What KinoList members are watching" movies={trending.data?.movies} isLoading={trending.isLoading} isError={trending.isError} onRetry={trending.refetch} />
          <MovieRail title="New and ongoing" subtitle="Current releases worth keeping up with" movies={ongoing.data?.movies} isLoading={ongoing.isLoading} isError={ongoing.isError} onRetry={ongoing.refetch} />
          <MovieRail title="Discover" subtitle="A broader mix for your next watch" movies={discover.data?.movies} isLoading={discover.isLoading} isError={discover.isError} onRetry={discover.refetch} />
        </>
      )}
    </Box>
  );
}
