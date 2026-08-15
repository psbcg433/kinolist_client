import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Chip, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { Link } from 'react-router-dom';
import {
  useDiscoverFeedQuery,
  useGenreFeedQuery,
  useOngoingFeedQuery,
  useSearchQuery,
  useTopRatedFeedQuery,
  useTrendingFeedQuery,
} from '../../api/discoveryApi';
import type { MovieSummary } from '../../api/types';
import { MovieLibraryActions } from '../../components/movie/MovieLibraryActions';
import { MovieCard } from '../../components/movie/MovieCard';
import { MovieRail } from '../../components/movie/MovieRail';
import { useAuth } from '../../hooks/useAuth';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useRecentActivitySections } from '../../hooks/useRecentActivitySections';
import { useRecentActivity } from '../../hooks/useRecentActivity';

const SLIDE_DURATION_MS = 7500;
const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];

function RecentRail({ title, query, kind }: { title: string; query: string; kind: 'search' | 'genre' }) {
  // This is a background content lookup, not a search submitted by the user.
  // `preview` prevents recommendation rails from polluting server-side history.
  const search = useSearchQuery({ q: query, preview: true }, { skip: kind !== 'search' });
  const genre = useGenreFeedQuery(query, { skip: kind !== 'genre' });
  const result = kind === 'search' ? search : genre;
  return <MovieRail title={title} subtitle="Inspired by your recent activity" movies={result.data?.movies} isLoading={result.isLoading} isError={result.isError} hideWhenEmpty hideWhenError />;
}

function CuratedGenreRail({ genre, title, subtitle }: { genre: string; title: string; subtitle: string }) {
  const result = useGenreFeedQuery(genre);
  return <MovieRail title={title} subtitle={subtitle} movies={result.data?.movies} isLoading={result.isLoading} isError={result.isError} hideWhenEmpty hideWhenError />;
}

function FeaturedStage({
  slides,
  trending,
  isLoading,
  authenticated,
}: {
  slides: MovieSummary[];
  trending: MovieSummary[];
  isLoading: boolean;
  authenticated: boolean;
}) {
  const [active, setActive] = useState(0);
  const trendingRef = useRef<HTMLDivElement | null>(null);
  const slideKey = slides.map((slide) => slide.imdbId).join('|');
  const movie = slides[active];
  const hasTrending = trending.length > 0;

  useEffect(() => setActive(0), [slideKey]);
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), SLIDE_DURATION_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, slideKey]);

  const scrollTrending = (direction: -1 | 1) => trendingRef.current?.scrollBy({ left: direction * trendingRef.current.clientWidth * .78, behavior: 'smooth' });

  if (isLoading) {
    return <Skeleton variant="rectangular" sx={{ height: { xs: 790, md: 760 }, mx: { xs: -2, sm: -3, lg: -4 }, mt: { xs: -2.5, md: -3 }, mb: 4 }} />;
  }

  const plot = movie?.plot;
  return (
    <Box
      component="section"
      aria-label="Featured and trending titles"
      sx={{
        position: 'relative', mx: { xs: -2, sm: -3, lg: -4 }, mt: { xs: -2.5, md: -3 }, mb: { xs: 3.5, md: 4.5 },
        height: hasTrending ? { xs: 790, sm: 760, lg: 790 } : { xs: 560, sm: 620, lg: 660 }, overflow: 'hidden', bgcolor: '#070711',
      }}
    >
      {movie?.posterUrl ? (
        <Box
          key={movie.imdbId}
          sx={{
            position: 'absolute', inset: 0,
            animation: active === 0 ? 'none' : 'featuredReveal .55s ease both',
            '@keyframes featuredReveal': { from: { opacity: 0, transform: 'scale(1.03)' }, to: { opacity: 1, transform: 'scale(1)' } },
          }}
        >
          <Box component="img" src={movie.posterUrl} alt="" loading="eager" fetchPriority="high" decoding="async" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right 18% top' }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,7,17,.97) 0%, rgba(7,7,17,.75) 38%, rgba(7,7,17,.08) 77%), linear-gradient(0deg, #070711 1%, rgba(7,7,17,.94) 20%, rgba(7,7,17,.12) 60%), radial-gradient(circle at 74% 30%, transparent 8%, rgba(7,7,17,.08) 54%, #070711 100%)' }} />
        </Box>
      ) : (
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 75% 28%, rgba(236,61,255,.34), transparent 27%), radial-gradient(circle at 58% 42%, rgba(77,87,255,.3), transparent 42%), linear-gradient(0deg, #070711, #130b22)' }} />
      )}

      <Box
        key={`copy-${movie?.imdbId ?? 'guest'}`}
        sx={{
          position: 'relative', zIndex: 1, width: { xs: '100%', md: '58%' }, maxWidth: 790,
          px: { xs: 3, sm: 6, md: 8 }, pt: { xs: 6, sm: 8, lg: 9 },
          animation: active === 0 ? 'none' : 'featuredCopy .45s ease both',
          '@keyframes featuredCopy': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        }}
      >
        <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '.2em', fontWeight: 900 }}>FEATURED TODAY</Typography>
        <Typography variant="h1" sx={{ mt: .8, maxWidth: 740, fontSize: { xs: '2.75rem', sm: '4rem', lg: '4.75rem' }, lineHeight: .94, textShadow: '0 12px 44px rgba(0,0,0,.78)' }}>
          {movie?.title ?? <>Stories worth <Box component="span" sx={{ color: 'primary.light' }}>remembering</Box></>}
        </Typography>
        {movie ? (
          <>
            <Stack direction="row" flexWrap="wrap" useFlexGap gap={.8} sx={{ mt: 2 }}>
              {movie.year && <Chip label={movie.year} size="small" />}
              {movie.imdbRating && <Chip icon={<StarRoundedIcon />} label={`${movie.imdbRating} IMDb`} size="small" color="primary" />}
              {movie.contentRating && <Chip label={movie.contentRating} size="small" />}
              {movie.runtime && <Chip label={movie.runtime} size="small" />}
              {movie.genres?.slice(0, 2).map((genre) => <Chip key={genre} label={genre} size="small" variant="outlined" />)}
            </Stack>
            <Typography
              color="rgba(241,235,250,.78)"
              sx={{ mt: 1.7, maxWidth: 610, lineHeight: 1.65, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: { xs: 3, sm: 2 }, overflow: 'hidden' }}
            >
              {plot || 'Explore the full storyline, cast, audience ratings, awards, and everything you need before choosing your next watch.'}
            </Typography>
          </>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 560 }}>Discover films and series, organise collections, and get recommendations shaped around your taste.</Typography>
        )}
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
          <Button component={Link} to={movie ? `/movie/${movie.imdbId}` : '/search'} variant="contained" startIcon={<PlayArrowRoundedIcon />}>{movie ? 'View details' : 'Explore catalogue'}</Button>
          <Button component={Link} to="/search" variant="outlined" color="inherit" startIcon={<SearchRoundedIcon />}>Search</Button>
          {!authenticated && <Button component={Link} to="/register" color="inherit">Join free</Button>}
        </Stack>
      </Box>

      {trending.length > 0 && <Box sx={{ position: 'absolute', zIndex: 2, left: { xs: 16, sm: 28, md: 42 }, right: 0, bottom: { xs: 22, md: 30 } }}>
        <Stack direction="row" alignItems="end" justifyContent="space-between" sx={{ pr: { xs: 2, md: 4 }, mb: 1.35 }}>
          <Box>
            <Typography variant="h5" component="h2">Trending now</Typography>
            <Typography variant="caption" color="text.secondary">The titles everyone is talking about</Typography>
          </Box>
          {trending.length > 0 && (
            <Stack direction="row" spacing={.7}>
              <IconButton aria-label="Scroll trending left" onClick={() => scrollTrending(-1)} size="small" sx={{ bgcolor: 'rgba(8,7,16,.82)', border: 1, borderColor: 'rgba(255,255,255,.2)' }}><ArrowBackIosNewRoundedIcon sx={{ fontSize: 15 }} /></IconButton>
              <IconButton aria-label="Scroll trending right" onClick={() => scrollTrending(1)} size="small" sx={{ bgcolor: 'rgba(8,7,16,.82)', border: 1, borderColor: 'rgba(255,255,255,.2)' }}><ArrowForwardIosRoundedIcon sx={{ fontSize: 15 }} /></IconButton>
            </Stack>
          )}
        </Stack>
        <Box
          ref={trendingRef}
          sx={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: { xs: '245px', sm: '285px', md: '310px', xl: '340px' }, gap: { xs: 1.25, md: 1.75 }, pr: 4, pb: 1.5, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
        >
          {trending.slice(0, 10).map((item, index) => <TrendingCard key={item.imdbId} movie={item} rank={index + 1} />)}
        </Box>
      </Box>}
    </Box>
  );
}

function TrendingCard({ movie, rank }: { movie: MovieSummary; rank: number }) {
  return (
    <Box sx={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', scrollSnapAlign: 'start', borderRadius: 2, bgcolor: '#15131f', border: 1, borderColor: 'rgba(255,255,255,.16)', boxShadow: '0 16px 38px rgba(0,0,0,.48)', transition: 'transform .22s ease, border-color .22s ease', '&:hover': { transform: 'translateY(-5px)', borderColor: 'rgba(195,154,255,.65)' } }}>
      <Box component={Link} to={`/movie/${movie.imdbId}`} aria-label={`View ${movie.title}`} sx={{ position: 'absolute', inset: 0, display: 'block' }}>
        <Box component="img" src={movie.posterUrl || undefined} alt="" loading="lazy" decoding="async" sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 24%', transform: 'scale(1.08)' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(6,6,14,.98) 0%, rgba(6,6,14,.62) 34%, transparent 70%), linear-gradient(90deg, rgba(6,6,14,.38), transparent 48%)' }} />
        <Typography sx={{ position: 'absolute', left: 12, top: 8, fontSize: '1.7rem', fontWeight: 950, color: 'rgba(255,255,255,.28)', lineHeight: 1 }}>#{String(rank).padStart(2, '0')}</Typography>
        <Box sx={{ position: 'absolute', left: 13, right: 12, bottom: 10 }}>
          <Typography fontWeight={850} noWrap>{movie.title}</Typography>
          <Stack direction="row" spacing={.8} alignItems="center"><Typography variant="caption" color="rgba(255,255,255,.68)">{movie.year}</Typography>{movie.imdbRating && <Typography variant="caption" color="#ffc857">★ {movie.imdbRating}</Typography>}</Stack>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: 9, right: 9, zIndex: 2 }}><MovieLibraryActions movie={movie} /></Box>
    </Box>
  );
}

function CategoryPills() {
  return (
    <Box component="section" sx={{ mb: { xs: 4, md: 5 } }}>
      <Stack direction="row" alignItems="end" justifyContent="space-between" spacing={2} sx={{ mb: 1.7 }}>
        <Box><Typography variant="h5" component="h2">Browse categories</Typography><Typography variant="body2" color="text.secondary">Jump straight into a genre</Typography></Box>
        <Button component={Link} to="/search" size="small" endIcon={<ArrowForwardRoundedIcon />}>All genres</Button>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {GENRES.map((genre, index) => (
          <Chip
            key={genre}
            component={Link}
            to={`/search?q=${encodeURIComponent(genre)}`}
            clickable
            label={genre}
            variant={index === 0 ? 'filled' : 'outlined'}
            color={index === 0 ? 'primary' : 'default'}
            sx={{ flexShrink: 0, height: 38, px: .7, color: index === 0 ? '#fff' : undefined, bgcolor: index === 0 ? 'primary.dark' : 'rgba(16,14,29,.72)', '&:hover': { borderColor: 'primary.main', bgcolor: index === 0 ? '#5522ad' : 'rgba(146,84,255,.12)' } }}
          />
        ))}
      </Stack>
    </Box>
  );
}

function RecentDiscoveryBlock({ releases, releasesLoading }: { releases: MovieSummary[]; releasesLoading: boolean }) {
  const { events } = useRecentActivity();
  const releasesRef = useRef<HTMLDivElement | null>(null);
  const recentlyViewed = useMemo(() => {
    const seen = new Set<string>();
    return events
      .filter((event) => event.type === 'view' && event.movie)
      .filter((event) => {
        const id = event.movie!.imdbId;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .slice(0, 5);
  }, [events]);

  if (!releasesLoading && releases.length === 0 && recentlyViewed.length === 0) return null;

  const hasHistory = recentlyViewed.length > 0;
  const hasReleases = releasesLoading || releases.length > 0;
  const scrollReleases = (direction: -1 | 1) => releasesRef.current?.scrollBy({ left: direction * releasesRef.current.clientWidth * .86, behavior: 'smooth' });
  return (
    <Grid2 container spacing={2.5} component="section" sx={{ mb: { xs: 5, md: 6 } }}>
      {hasReleases && (
        <Grid2 size={{ xs: 12, lg: hasHistory ? 8 : 12 }}>
          <Stack direction="row" alignItems="end" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Box><Typography variant="h5" component="h2">Recent releases</Typography><Typography variant="body2" color="text.secondary">New and recently released titles worth discovering</Typography></Box>
            {!releasesLoading && releases.length > 2 && (
              <Stack direction="row" spacing={.6}>
                <IconButton size="small" aria-label="Scroll recent releases left" onClick={() => scrollReleases(-1)} sx={{ border: 1, borderColor: 'divider' }}><ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" aria-label="Scroll recent releases right" onClick={() => scrollReleases(1)} sx={{ border: 1, borderColor: 'divider' }}><ArrowForwardIosRoundedIcon sx={{ fontSize: 16 }} /></IconButton>
              </Stack>
            )}
          </Stack>
          {releasesLoading ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>{Array.from({ length: 2 }, (_, index) => <Skeleton key={index} variant="rounded" sx={{ height: 620, borderRadius: '30px' }} />)}</Box>
          ) : (
            <Box ref={releasesRef} sx={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: { xs: 'minmax(285px, 86vw)', sm: 'minmax(300px, calc((100% - 20px) / 2))' }, gap: 2.5, overflowX: 'auto', scrollSnapType: 'x proximity', scrollbarWidth: 'none', pb: 1, '&::-webkit-scrollbar': { display: 'none' }, '& > *': { scrollSnapAlign: 'start' } }}>
              {releases.slice(0, 8).map((movie) => <MovieCard key={movie.imdbId} movie={movie} />)}
            </Box>
          )}
        </Grid2>
      )}
      {hasHistory && (
        <Grid2 size={{ xs: 12, lg: hasReleases ? 4 : 12 }}>
          <Card sx={{ position: 'relative', p: { xs: 2, md: 2.4 }, height: '100%', overflow: 'hidden', background: 'radial-gradient(circle at 105% -5%, rgba(146,84,255,.25), transparent 35%), linear-gradient(155deg, #151124, #0c0a15 70%)', borderColor: 'rgba(190,145,255,.22)' }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2.1 }}>
              <Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 2.2, color: 'primary.light', bgcolor: 'rgba(146,84,255,.16)', border: '1px solid rgba(190,145,255,.24)' }}><HistoryRoundedIcon /></Box>
              <Box><Typography variant="h6" component="h2" fontWeight={850}>Recently viewed</Typography><Typography variant="caption" color="text.secondary">Pick up where you left off</Typography></Box>
            </Stack>
            <Stack spacing={1}>
              {recentlyViewed.map((event, index) => {
                const movie = event.movie!;
                return (
                  <Box key={movie.imdbId} component={Link} to={`/movie/${movie.imdbId}`} sx={{ position: 'relative', display: 'grid', gridTemplateColumns: '58px minmax(0, 1fr) 24px', gap: 1.25, alignItems: 'center', p: 1, borderRadius: 2.5, color: 'inherit', textDecoration: 'none', bgcolor: 'rgba(255,255,255,.025)', border: '1px solid rgba(190,145,255,.1)', transition: 'transform .2s ease, background-color .2s ease, border-color .2s ease', '&:hover': { transform: 'translateX(-3px)', bgcolor: 'rgba(146,84,255,.1)', borderColor: 'rgba(190,145,255,.32)' } }}>
                    <Box sx={{ position: 'relative', width: 58, height: 76, overflow: 'hidden', borderRadius: 1.6, bgcolor: 'rgba(146,84,255,.14)', display: 'grid', placeItems: 'center' }}>
                      <Typography color="primary.light" fontWeight={900}>{movie.title.charAt(0)}</Typography>
                      {movie.posterUrl && <Box component="img" src={movie.posterUrl} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                      <Box sx={{ position: 'absolute', left: 4, top: 4, minWidth: 23, height: 23, px: .45, display: 'grid', placeItems: 'center', borderRadius: 1, bgcolor: 'rgba(7,7,17,.88)', color: index < 3 ? 'primary.light' : 'text.secondary', fontSize: '.65rem', fontWeight: 900 }}>#{index + 1}</Box>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={850} sx={{ lineHeight: 1.25, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>{movie.title}</Typography>
                      {movie.genres?.[0] && <Typography variant="overline" color="primary.light" sx={{ display: 'block', mt: .35, fontSize: '.6rem', lineHeight: 1.4, letterSpacing: '.1em' }}>{movie.genres.slice(0, 2).join(' · ')}</Typography>}
                      <Typography variant="caption" color="text.secondary">{movie.year || 'Viewed recently'}</Typography>
                    </Box>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </Box>
                );
              })}
            </Stack>
          </Card>
        </Grid2>
      )}
    </Grid2>
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
  const slides = useMemo(() => {
    const source = topRated.data?.movies?.length ? topRated.data.movies : trending.data?.movies ?? [];
    return source.filter((movie, index, all) => all.findIndex((candidate) => candidate.imdbId === movie.imdbId) === index).slice(0, 5);
  }, [topRated.data?.movies, trending.data?.movies]);

  return (
    <Box>
      <FeaturedStage slides={slides} trending={trending.data?.movies ?? []} isLoading={isAuthenticated && slides.length === 0 && (topRated.isLoading || trending.isLoading)} authenticated={isAuthenticated} />
      <CategoryPills />
      {isAuthenticated ? (
        <>
          <RecentDiscoveryBlock releases={ongoing.data?.movies ?? []} releasesLoading={ongoing.isLoading} />
          <MovieRail title="Recommended for you" subtitle="A mix selected from today’s catalogue" movies={discover.data?.movies} isLoading={discover.isLoading} isError={discover.isError} hideWhenEmpty hideWhenError />
          {sections.map((section) => <RecentRail key={`${section.event.id}-${section.query}`} title={section.title} query={section.query} kind={section.kind} />)}
          <CuratedGenreRail genre="action" title="Action packed" subtitle="High-energy stories, heroes, and spectacular set pieces" />
          <CuratedGenreRail genre="adventure" title="Adventure awaits" subtitle="Epic journeys and worlds beyond the familiar" />
          <CuratedGenreRail genre="sci-fi" title="Explore new worlds" subtitle="Science fiction, future technology, and distant galaxies" />
          <CuratedGenreRail genre="thriller" title="Edge of your seat" subtitle="Tense mysteries and stories that keep moving" />
          <CuratedGenreRail genre="animation" title="Animated favourites" subtitle="Imaginative stories for every kind of audience" />
          <MovieRail title="Top rated" subtitle="Critically and audience-approved titles" movies={topRated.data?.movies} isLoading={topRated.isLoading} isError={topRated.isError} hideWhenEmpty hideWhenError />
        </>
      ) : (
        <Box sx={{ py: 4, px: { xs: 2.5, md: 4 }, border: 1, borderColor: 'divider', borderRadius: 3, background: 'linear-gradient(120deg, rgba(146,84,255,.15), rgba(236,61,255,.08), #100e1d)' }}>
          <Typography variant="h4" component="h2">Build a watchlist that remembers everything.</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5 }}>Join KinoList for personal feeds, favourites, watchlists, and custom collections.</Typography>
          <Button component={Link} to="/register" variant="contained">Create account</Button>
        </Box>
      )}
    </Box>
  );
}
