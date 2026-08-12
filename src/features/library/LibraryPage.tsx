import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Link } from 'react-router-dom';
import {
  useListPlaylistsQuery,
  useGetSummaryQuery,
  useDeletePlaylistMutation,
} from '../../api/libraryApi';
import { usePlaylistActions } from '../../hooks/usePlaylistActions';
import { usePageMeta } from '../../hooks/usePageMeta';
import { LoadingState, EmptyState } from '../../components/state';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAppDispatch } from '../../store/hooks';
import { pushToast } from '../../store/uiSlice';
import type { Playlist } from '../../api/types';

export default function LibraryPage() {
  usePageMeta('My Library');
  const { data: playlistsData, isLoading } = useListPlaylistsQuery();
  const { data: summaryData } = useGetSummaryQuery();
  const [deletePlaylist] = useDeletePlaylistMutation();
  const { create } = usePlaylistActions();
  const dispatch = useAppDispatch();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Playlist | null>(null);

  const playlists = playlistsData?.playlists ?? [];
  const summary = summaryData?.summary;

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }
    const pl = await create(trimmed, description.trim() || undefined);
    if (pl) {
      setCreateOpen(false);
      setName('');
      setDescription('');
      setNameError(null);
    } else {
      setNameError('A playlist with that name may already exist.');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const res = await deletePlaylist(toDelete.id);
    if ('error' in res) {
      dispatch(pushToast({ message: 'Could not delete playlist', severity: 'error' }));
    } else {
      dispatch(pushToast({ message: `Deleted “${toDelete.name}”`, severity: 'info' }));
    }
    setToDelete(null);
  };

  return (
    <Box>
      <PageHeader
        title="My Library"
        subtitle={
          summary
            ? `${summary.favouritesCount} favourites · ${summary.watchlistCount} watchlist · ${summary.customPlaylists.length} custom`
            : undefined
        }
        action={
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            New playlist
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : playlists.length === 0 ? (
        <EmptyState label="Your library is empty — start adding films" />
      ) : (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            System lists
          </Typography>
          <Grid2 container spacing={2} sx={{ mb: 4 }}>
            {playlists
              .filter((p) => p.isSystem)
              .map((p) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                  <SystemPlaylistCard p={p} />
                </Grid2>
              ))}
          </Grid2>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Custom playlists
          </Typography>
          <Grid2 container spacing={2}>
            {playlists
              .filter((p) => !p.isSystem)
              .map((p) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                  <Card>
                    <CardActionArea component={Link} to={`/library/playlists/${p.id}`}>
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {p.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {p.description || 'No description'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.itemCount} item{p.itemCount === 1 ? '' : 's'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <Box sx={{ px: 2, pb: 1.5 }}>
                      <Button size="small" color="error" onClick={() => setToDelete(p)}>
                        Delete
                      </Button>
                    </Box>
                  </Card>
                </Grid2>
              ))}
          </Grid2>
        </Box>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
            }}
            error={!!nameError}
            helperText={nameError}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete playlist?"
        message={toDelete ? `“${toDelete.name}” and its ${toDelete.itemCount} items will be deleted. This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}

function SystemPlaylistCard({ p }: { p: Playlist }) {
  const isFavourites = p.type === 'favourites';
  return (
    <Card>
      <CardActionArea component={Link} to={isFavourites ? '/library/favourites' : '/library/watchlist'}>
        <CardContent>
          <Typography variant="h6">{isFavourites ? '★ Favourites' : '✓ Watchlist'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {p.itemCount} item{p.itemCount === 1 ? '' : 's'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
