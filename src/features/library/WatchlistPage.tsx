import { Box } from '@mui/material';
import { useGetWatchlistQuery } from '../../api/libraryApi';
import { usePageMeta } from '../../hooks/usePageMeta';
import { MovieGrid } from '../../components/movie/MovieGrid';
import { LoadingState, EmptyState } from '../../components/state';
import { PageHeader } from '../../components/ui/PageHeader';

export default function WatchlistPage() {
  usePageMeta('Watchlist');
  const { data, isLoading } = useGetWatchlistQuery();
  const playlist = data?.playlist;
  const items = playlist?.items ?? [];

  if (isLoading) return <LoadingState />;

  return (
    <Box>
      <PageHeader
        title="Watchlist"
        subtitle={`${items.length} film${items.length === 1 ? '' : 's'}`}
      />
      {items.length === 0 ? (
        <EmptyState label="Your watchlist is empty — save films for later" />
      ) : (
        <MovieGrid
          movies={items.map((i) => ({ imdbId: i.imdbId, title: i.title, year: '', type: '', posterUrl: i.posterUrl }))}
        />
      )}
    </Box>
  );
}
