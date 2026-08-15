import { Box } from '@mui/material';
import { useGetFavouritesQuery } from '../../api/libraryApi';
import { usePageMeta } from '../../hooks/usePageMeta';
import { MovieGrid } from '../../components/movie/MovieGrid';
import { LoadingState, EmptyState } from '../../components/state';
import { PageHeader } from '../../components/ui/PageHeader';

export default function FavouritesPage() {
  usePageMeta('Favourites');
  const { data, isLoading } = useGetFavouritesQuery();
  const playlist = data?.playlist;
  const items = playlist?.items ?? [];

  if (isLoading) return <LoadingState />;

  return (
    <Box>
      <PageHeader
        title="Favourites"
        subtitle={`${items.length} film${items.length === 1 ? '' : 's'}`}
      />
      {items.length === 0 ? (
        <EmptyState label="No favourites yet — add some from any movie page" />
      ) : (
        <MovieGrid
          movies={items.map((i) => ({ imdbId: i.imdbId, title: i.title, year: '', type: '', posterUrl: i.posterUrl }))}
        />
      )}
    </Box>
  );
}
