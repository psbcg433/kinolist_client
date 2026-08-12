import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { usePageMeta } from '../../hooks/usePageMeta';

export function PosterGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <Box
      aria-label="Loading movies"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(3, minmax(0, 1fr))',
          md: 'repeat(5, minmax(0, 1fr))',
          lg: 'repeat(6, minmax(0, 1fr))',
        },
        gap: { xs: 1.5, md: 2.5 },
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Box key={index}>
          <Skeleton variant="rounded" animation="wave" sx={{ width: '100%', aspectRatio: '2 / 3' }} />
          <Skeleton animation="wave" width="82%" sx={{ mt: 1 }} />
          <Skeleton animation="wave" width="42%" />
        </Box>
      ))}
    </Box>
  );
}

export function PageSkeleton() {
  return (
    <Box aria-label="Loading page" sx={{ py: { xs: 3, md: 5 } }}>
      <Skeleton variant="rounded" animation="wave" height={300} sx={{ mb: 5, borderRadius: 4 }} />
      <Skeleton animation="wave" width={220} height={40} sx={{ mb: 2 }} />
      <PosterGridSkeleton count={6} />
    </Box>
  );
}

export function MovieDetailSkeleton() {
  return (
    <Box aria-label="Loading movie details" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 4 }}>
      <Skeleton variant="rounded" sx={{ width: '100%', maxWidth: { xs: 280, md: 'none' }, mx: { xs: 'auto', md: 0 }, aspectRatio: '2 / 3' }} />
      <Stack spacing={1.5}>
        <Skeleton width="70%" height={66} />
        <Skeleton width="34%" />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={70} height={28} />
          <Skeleton variant="rounded" width={90} height={28} />
          <Skeleton variant="rounded" width={76} height={28} />
        </Stack>
        <Skeleton variant="rounded" width="55%" height={46} sx={{ mt: 2 }} />
        <Skeleton width="100%" />
        <Skeleton width="95%" />
        <Skeleton width="88%" />
      </Stack>
    </Box>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <Stack spacing={2} aria-label={label}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <PosterGridSkeleton />
    </Stack>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  requestId?: string | null;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function ErrorState({ title = 'Something went wrong', message, requestId, onRetry, children }: ErrorStateProps) {
  return (
    <Box sx={{ py: 10, px: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>{title}</Typography>
      {message && <Typography color="text.secondary" sx={{ mt: 1 }}>{message}</Typography>}
      {requestId && <Typography variant="caption" color="text.secondary">Request ID: {requestId}</Typography>}
      {onRetry && <Button variant="contained" onClick={onRetry} sx={{ mt: 2 }}>Try again</Button>}
      {children}
    </Box>
  );
}

export function EmptyState({ label = 'Nothing here yet' }: { label?: string }) {
  return (
    <Box sx={{ py: 8, px: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 3 }}>
      <Typography variant="h6" color="text.secondary">{label}</Typography>
    </Box>
  );
}

export function NotFoundPage() {
  usePageMeta('Not found');
  return <ErrorState title="Page not found" message="The page you are looking for does not exist." />;
}
