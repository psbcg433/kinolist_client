import { Box, Button, Card, Chip, Skeleton, Stack, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TheatersRoundedIcon from '@mui/icons-material/TheatersRounded';
import { Link } from 'react-router-dom';
import {
  useDiscoverFeedQuery,
  useGenreFeedQuery,
  useOngoingFeedQuery,
  useSearchQuery,
  useTopRatedFeedQuery,
  useTrendingFeedQuery,
} from '../../api/discoveryApi';
import { useGetSummaryQuery } from '../../api/libraryApi';
import type { MovieSummary } from '../../api/types';
import { MovieCard } from '../../components/movie/MovieCard';
import { MovieRail } from '../../components/movie/MovieRail';
import { useAuth } from '../../hooks/useAuth';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useRecentActivitySections } from '../../hooks/useRecentActivitySections';

const GENRE_TILES = [
  { name: 'Action', icon: <BoltRoundedIcon />, tone: '#e24b72' },
  { name: 'Drama', icon: <TheatersRoundedIcon />, tone: '#7d5cff' },
  { name: 'Sci-Fi', icon: <AutoAwesomeRoundedIcon />, tone: '#00b8d9' },
  { name: 'Horror', icon: <LocalFireDepartmentRoundedIcon />, tone: '#ff6b42' },
  { name: 'Comedy', icon: <StarRoundedIcon />, tone: '#d9b23d' },
  { name: 'Thriller', icon: <SearchRoundedIcon />, tone: '#27c499' },
];

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

function DashboardHero({ movie, isLoading }: { movie?: MovieSummary; isLoading: boolean }) {
  if (isLoading) return <Skeleton variant="rounded" height={430} sx={{ borderRadius: 3 }} />;

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: 420, lg: 430 },
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        border: 1,
        borderColor: 'rgba(170,107,255,.25)',
        borderRadius: 3,
        backgroundColor: '#10081c',
        backgroundImage: movie?.posterUrl
          ? `linear-gradient(90deg, rgba(12,6,24,.99) 0%, rgba(12,6,24,.9) 45%, rgba(12,6,24,.08) 82%), linear-gradient(0deg, rgba(12,6,24,.65), transparent 50%), url("${movie.posterUrl}")`
          : 'radial-gradient(circle at 82% 45%, rgba(236,61,255,.45), transparent 28%), radial-gradient(circle at 66% 45%, rgba(97,58,255,.4), transparent 38%), linear-gradient(120deg, #10081c, #080711)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: movie?.posterUrl ? 'cover, cover, min(46vw, 610px) auto' : 'auto',
        backgroundPosition: movie?.posterUrl ? 'center, center, right 24% center' : 'center',
        boxShadow: 'inset 0 0 70px rgba(146,84,255,.08)',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, width: { xs: '100%', md: '64%' }, p: { xs: 3, sm: 4, lg: 5 } }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 28, height: 2, bgcolor: 'secondary.main', boxShadow: '0 0 12px #ec3dff' }} />
          <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '.17em', fontWeight: 900 }}>
            {movie ? 'FEATURED FOR YOU' : 'LEVEL UP YOUR WATCHLIST'}
          </Typography>
        </Stack>
        <Typography variant="h2" component="h1" sx={{ mt: 1.2, maxWidth: 700, fontSize: { xs: '2.5rem', sm: '3.6rem', lg: '4.2rem' }, lineHeight: .98 }}>
          {movie?.title ?? <>Discover your next <Box component="span" sx={{ color: 'primary.light' }}>legendary</Box> story</>}
        </Typography>
        {movie ? (
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 2 }}>
            {movie.year && <Chip label={movie.year} size="small" />}
            {movie.imdbRating && <Chip icon={<StarRoundedIcon />} label={`${movie.imdbRating} IMDb`} size="small" color="primary" />}
            {movie.runtime && <Chip label={movie.runtime} size="small" />}
            {movie.genres?.slice(0, 2).map((genre) => <Chip key={genre} label={genre} size="small" variant="outlined" />)}
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 570 }}>
            Explore films and series, organise your library, and find recommendations shaped around your taste.
          </Typography>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 3, alignItems: { xs: 'stretch', sm: 'center' } }}>
          <Button component={Link} to={movie ? `/movie/${movie.imdbId}` : '/search'} variant="contained" size="large" startIcon={<PlayArrowRoundedIcon />}>
            {movie ? 'Explore title' : 'Explore catalogue'}
          </Button>
          <Button component={Link} to="/search" variant="outlined" color="inherit" size="large" startIcon={<SearchRoundedIcon />}>
            Search movies
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

function StatCards({ favourites, watchlist, custom }: { favourites: number; watchlist: number; custom: number }) {
  const cards = [
    { label: 'Favourites', value: favourites, icon: <FavoriteRoundedIcon />, color: '#f25f86' },
    { label: 'Watchlist', value: watchlist, icon: <BookmarkRoundedIcon />, color: '#a87bff' },
    { label: 'Collections', value: custom, icon: <TheatersRoundedIcon />, color: '#27c9bd' },
  ];
  return (
    <Grid2 container spacing={1.5} sx={{ height: '100%' }}>
      {cards.map((card) => (
        <Grid2 size={{ xs: 4, lg: 12 }} key={card.label}>
          <Card sx={{ height: '100%', minHeight: { lg: 132 }, p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5 }}>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 2, color: card.color, bgcolor: `${card.color}18`, border: `1px solid ${card.color}38` }}>{card.icon}</Box>
            <Box>
              <Typography variant="h5" sx={{ lineHeight: 1 }}>{card.value}</Typography>
              <Typography variant="caption" color="text.secondary">{card.label}</Typography>
            </Box>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  );
}

function SectionHeading({ title, subtitle, to }: { title: string; subtitle?: string; to?: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="end" spacing={2} sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h5" component="h2">{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: .35 }}>{subtitle}</Typography>}
      </Box>
      {to && <Button component={Link} to={to} size="small" endIcon={<ArrowForwardRoundedIcon />}>View all</Button>}
    </Stack>
  );
}

function RankedList({ movies, isLoading }: { movies: MovieSummary[]; isLoading: boolean }) {
  return (
    <Card sx={{ p: 2.25, height: '100%' }}>
      <SectionHeading title="Top ranked" subtitle="Highest rated picks" />
      <Stack spacing={1.2}>
        {isLoading
          ? Array.from({ length: 5 }, (_, index) => <Skeleton key={index} variant="rounded" height={64} />)
          : movies.slice(0, 5).map((movie, index) => (
            <Box component={Link} to={`/movie/${movie.imdbId}`} key={movie.imdbId} sx={{ display: 'grid', gridTemplateColumns: '28px 44px minmax(0,1fr) auto', alignItems: 'center', gap: 1.25, p: .65, borderRadius: 2, textDecoration: 'none', '&:hover': { bgcolor: 'rgba(146,84,255,.09)' } }}>
              <Typography color={index < 3 ? 'primary.light' : 'text.secondary'} sx={{ fontWeight: 900 }}>#{index + 1}</Typography>
              <Box component="img" src={movie.posterUrl || undefined} alt="" sx={{ width: 44, height: 58, objectFit: 'cover', borderRadius: 1 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={800} noWrap>{movie.title}</Typography>
                <Typography variant="caption" color="text.secondary">{movie.year} · {movie.type}</Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={.4}>
                <StarRoundedIcon sx={{ color: '#ffc857', fontSize: 17 }} />
                <Typography variant="caption" fontWeight={800}>{movie.imdbRating ?? '—'}</Typography>
              </Stack>
            </Box>
          ))}
      </Stack>
    </Card>
  );
}

function GenreTiles() {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <SectionHeading title="Trending categories" subtitle="Pick a mood and start exploring" to="/search" />
      <Grid2 container spacing={1.5}>
        {GENRE_TILES.map((genre) => (
          <Grid2 size={{ xs: 6, sm: 4, md: 2 }} key={genre.name}>
            <Card component={Link} to={`/search?q=${encodeURIComponent(genre.name)}`} sx={{ display: 'flex', minHeight: 104, p: 2, flexDirection: 'column', justifyContent: 'space-between', color: 'inherit', textDecoration: 'none', background: `linear-gradient(145deg, ${genre.tone}20, rgba(16,14,29,.96))`, '&:hover': { borderColor: `${genre.tone}70`, transform: 'translateY(-3px)' }, transition: 'all .2s ease' }}>
              <Box sx={{ color: genre.tone }}>{genre.icon}</Box>
              <Typography variant="body2" fontWeight={850}>{genre.name}</Typography>
            </Card>
          </Grid2>
        ))}
      </Grid2>
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
  const topRated = useTopRatedFeedQuery(undefined, { skip: !isAuthenticated });
  const { data: summaryData } = useGetSummaryQuery(undefined, { skip: !isAuthenticated });
  const summary = summaryData?.summary;
  const heroMovie = discover.data?.movies?.[0] ?? trending.data?.movies?.[0];

  return (
    <Box>
      <Grid2 container spacing={2} sx={{ mb: 5 }}>
        <Grid2 size={{ xs: 12, lg: isAuthenticated ? 9 : 12 }}>
          <DashboardHero movie={heroMovie} isLoading={isAuthenticated && discover.isLoading} />
        </Grid2>
        {isAuthenticated && (
          <Grid2 size={{ xs: 12, lg: 3 }}>
            <StatCards favourites={summary?.favouritesCount ?? 0} watchlist={summary?.watchlistCount ?? 0} custom={summary?.customPlaylists.length ?? 0} />
          </Grid2>
        )}
      </Grid2>

      <GenreTiles />

      {!isAuthenticated ? (
        <Card sx={{ position: 'relative', overflow: 'hidden', p: { xs: 3, md: 5 }, background: 'radial-gradient(circle at 82% 35%, rgba(236,61,255,.22), transparent 26%), linear-gradient(120deg, rgba(146,84,255,.14), #100e1d 55%)' }}>
          <Typography variant="overline" color="primary.light" fontWeight={900}>YOUR LIBRARY, YOUR RULES</Typography>
          <Typography variant="h4" sx={{ mt: .5 }}>Build a watchlist that remembers everything.</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5, maxWidth: 620 }}>Join KinoList to unlock live discovery, favourites, watchlists, personal collections, and recommendations.</Typography>
          <Stack direction="row" spacing={1.5}>
            <Button component={Link} to="/register" variant="contained">Join free</Button>
            <Button component={Link} to="/login" variant="outlined">Sign in</Button>
          </Stack>
        </Card>
      ) : (
        <>
          <Grid2 container spacing={2.5} sx={{ mb: 5 }}>
            <Grid2 size={{ xs: 12, lg: 8 }}>
              <SectionHeading title="Trending now" subtitle="What KinoList members are exploring" to="/search" />
              {trending.isLoading ? (
                <Grid2 container spacing={1.5}>{Array.from({ length: 4 }, (_, index) => <Grid2 size={{ xs: 6, sm: 3 }} key={index}><Skeleton variant="rounded" sx={{ aspectRatio: '2/3' }} /></Grid2>)}</Grid2>
              ) : (
                <Grid2 container spacing={1.5}>{(trending.data?.movies ?? []).slice(0, 4).map((movie) => <Grid2 size={{ xs: 6, sm: 3 }} key={movie.imdbId}><MovieCard movie={movie} /></Grid2>)}</Grid2>
              )}
            </Grid2>
            <Grid2 size={{ xs: 12, lg: 4 }}>
              <RankedList movies={topRated.data?.movies ?? []} isLoading={topRated.isLoading} />
            </Grid2>
          </Grid2>

          {sections.map((section) => <RecentRail key={`${section.event.id}-${section.query}`} title={section.title} query={section.query} kind={section.kind} />)}
          <MovieRail title="Top rated" subtitle="Critically and audience-approved titles" movies={topRated.data?.movies} isLoading={topRated.isLoading} isError={topRated.isError} onRetry={topRated.refetch} />
          {(ongoing.isLoading || (ongoing.data?.movies.length ?? 0) > 0) && <MovieRail title="Recent releases" subtitle="New titles worth keeping up with" movies={ongoing.data?.movies} isLoading={ongoing.isLoading} isError={ongoing.isError} onRetry={ongoing.refetch} />}
          <MovieRail title="Discover more" subtitle="A broader mix for your next watch" movies={discover.data?.movies?.slice(1)} isLoading={discover.isLoading} isError={discover.isError} onRetry={discover.refetch} />
        </>
      )}
    </Box>
  );
}
