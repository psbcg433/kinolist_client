import { Box, Typography } from '@mui/material';
import {
  useRecommendFavouritesQuery,
  useRecommendLastSearchQuery,
  useRecommendSearchHistoryQuery,
  useRecommendWatchlistQuery,
} from '../../api/discoveryApi';
import { MovieRail } from '../../components/movie/MovieRail';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useAppSelector } from '../../store/hooks';

export default function RecommendationsPage() {
  usePageMeta('For You');
  const userId = useAppSelector((state) => state.auth.user?.id) ?? '';
  const lastSearch = useRecommendLastSearchQuery(userId, { skip: !userId });
  const history = useRecommendSearchHistoryQuery(userId, { skip: !userId });
  const favourites = useRecommendFavouritesQuery(userId, { skip: !userId });
  const watchlist = useRecommendWatchlistQuery(userId, { skip: !userId });

  return (
    <Box>
      <Box sx={{ maxWidth: 760, mb: { xs: 4, md: 6 } }}>
        <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '.16em', fontWeight: 800 }}>
          Personalised discovery
        </Typography>
        <Typography variant="h3" component="h1" sx={{ mt: 0.5 }}>Picked for you</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          These rows evolve as you search, favourite titles, and shape your watchlist.
        </Typography>
      </Box>

      <MovieRail title="From your last search" subtitle="Close matches to your latest query" movies={lastSearch.data?.movies} isLoading={lastSearch.isLoading} isError={lastSearch.isError} onRetry={lastSearch.refetch} emptyLabel="Search for a title to unlock this row." />
      <MovieRail title="From your search history" subtitle="Patterns from the things you keep looking for" movies={history.data?.movies} isLoading={history.isLoading} isError={history.isError} onRetry={history.refetch} emptyLabel="Your search history has not produced recommendations yet." />
      <MovieRail title="Because of your favourites" subtitle="More titles with a similar feel" movies={favourites.data?.movies} isLoading={favourites.isLoading} isError={favourites.isError} onRetry={favourites.refetch} emptyLabel="Favourite a few titles to tune this row." />
      <MovieRail title="Based on your watchlist" subtitle="Keep exploring what you plan to watch" movies={watchlist.data?.movies} isLoading={watchlist.isLoading} isError={watchlist.isError} onRetry={watchlist.refetch} emptyLabel="Add titles to your watchlist to tune this row." />
    </Box>
  );
}
