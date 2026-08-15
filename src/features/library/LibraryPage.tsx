import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  useDeletePlaylistMutation,
  useGetPlaylistQuery,
  useGetSummaryQuery,
  useListPlaylistsQuery,
} from '../../api/libraryApi';
import type { MovieSummary, Playlist } from '../../api/types';
import { MovieRail } from '../../components/movie/MovieRail';
import { EmptyState, LoadingState } from '../../components/state';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { usePageMeta } from '../../hooks/usePageMeta';
import { usePlaylistActions } from '../../hooks/usePlaylistActions';
import { useAppDispatch } from '../../store/hooks';
import { pushToast } from '../../store/uiSlice';

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
  const populatedPlaylists = playlists.filter((playlist) => playlist.itemCount > 0);
  const summary = summaryData?.summary;

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }
    const playlist = await create(trimmed, description.trim() || undefined);
    if (!playlist) {
      setNameError('A playlist with that name may already exist.');
      return;
    }
    setCreateOpen(false);
    setName('');
    setDescription('');
    setNameError(null);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const result = await deletePlaylist(toDelete.id);
    if ('error' in result) dispatch(pushToast({ message: 'Could not delete playlist', severity: 'error' }));
    else dispatch(pushToast({ message: `Deleted “${toDelete.name}”`, severity: 'info' }));
    setToDelete(null);
  };

  return (
    <Box>
      <PageHeader
        title="My Library"
        subtitle={summary ? `${summary.favouritesCount} favourites · ${summary.watchlistCount} watchlist · ${summary.customPlaylists.length} custom` : undefined}
        action={<Button variant="contained" onClick={() => setCreateOpen(true)}>New playlist</Button>}
      />

      {isLoading ? <LoadingState /> : populatedPlaylists.length === 0 ? <EmptyState label="Your library is empty — start adding films" /> : (
        <Box>
          {populatedPlaylists.map((playlist) => (
            <LibraryPlaylistRail key={playlist.id} playlist={playlist} onDelete={() => setToDelete(playlist)} />
          ))}
        </Box>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create playlist</DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Name" fullWidth value={name} onChange={(event) => { setName(event.target.value); setNameError(null); }} error={Boolean(nameError)} helperText={nameError} sx={{ mb: 2, mt: 1 }} />
          <TextField label="Description (optional)" fullWidth multiline rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
        </DialogContent>
        <DialogActions><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleCreate} disabled={!name.trim()}>Create</Button></DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
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

function LibraryPlaylistRail({ playlist, onDelete }: { playlist: Playlist; onDelete: () => void }) {
  const detail = useGetPlaylistQuery(playlist.id);
  const resolved = detail.data?.playlist ?? playlist;
  const movies: MovieSummary[] = (resolved.items ?? []).map((item) => ({
    imdbId: item.imdbId,
    title: item.title,
    year: '',
    type: '',
    posterUrl: item.posterUrl,
  }));
  const action = !playlist.isSystem ? (
    <Button color="error" size="small" startIcon={<DeleteOutlineRoundedIcon />} onClick={onDelete}>Delete playlist</Button>
  ) : undefined;

  return (
    <MovieRail
      title={resolved.name}
      subtitle={resolved.description || `${resolved.itemCount} title${resolved.itemCount === 1 ? '' : 's'}`}
      movies={movies}
      isLoading={detail.isLoading}
      isError={detail.isError}
      onRetry={detail.refetch}
      emptyLabel="No titles in this playlist yet."
      action={action}
      removalPlaylist={{ id: resolved.id, name: resolved.name }}
    />
  );
}
