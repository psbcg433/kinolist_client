import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  useGetPlaylistQuery,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
} from '../../api/libraryApi';
import { usePageMeta } from '../../hooks/usePageMeta';
import { MovieGrid } from '../../components/movie/MovieGrid';
import { LoadingState, ErrorState, EmptyState } from '../../components/state';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { pushToast } from '../../store/uiSlice';

export default function PlaylistPage() {
  const { playlistId = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, refetch } = useGetPlaylistQuery(playlistId);
  const [updatePlaylist] = useUpdatePlaylistMutation();
  const [deletePlaylist] = useDeletePlaylistMutation();

  const [editName, setEditName] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const playlist = data?.playlist;

  usePageMeta(playlist?.name ?? 'Playlist');

  if (isLoading) return <LoadingState />;
  if (isError || !playlist) {
    return <ErrorState title="Could not load this playlist" onRetry={refetch} />;
  }

  const isCustom = !playlist.isSystem;
  const items = playlist.items ?? [];

  const handleSaveEdit = async () => {
    if (editName === null) return;
    const name = editName.trim();
    if (!name) return;
    const res = await updatePlaylist({
      id: playlist.id,
      name,
      description: editDesc.trim(),
    });
    if ('error' in res) {
      dispatch(pushToast({ message: 'Could not save changes', severity: 'error' }));
      return;
    }
    dispatch(pushToast({ message: 'Playlist updated', severity: 'success' }));
    setEditName(null);
  };

  const handleDelete = async () => {
    const res = await deletePlaylist(playlist.id);
    if ('error' in res) {
      dispatch(pushToast({ message: 'Could not delete playlist', severity: 'error' }));
      return;
    }
    dispatch(pushToast({ message: `Deleted “${playlist.name}”`, severity: 'info' }));
    navigate('/library');
  };

  return (
    <Box>
      {editName !== null && isCustom ? (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Name"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save
            </Button>
            <Button onClick={() => setEditName(null)}>Cancel</Button>
          </Box>
        </Box>
      ) : (
        <PageHeader
          title={playlist.name}
          subtitle={
            isCustom
              ? playlist.description || 'No description'
              : `${playlist.type} · system playlist`
          }
          action={
            isCustom ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => { setEditName(playlist.name); setEditDesc(playlist.description); }}>
                  Edit
                </Button>
                <Button color="error" onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              </Box>
            ) : undefined
          }
        />
      )}

      {items.length === 0 ? (
        <EmptyState label="No items in this playlist yet" />
      ) : (
        <MovieGrid
          movies={items.map((i) => ({
            imdbId: i.imdbId,
            title: i.title,
            year: '',
            type: '',
            posterUrl: i.posterUrl,
          }))}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete playlist?"
        message={`“${playlist.name}” will be permanently deleted.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </Box>
  );
}
