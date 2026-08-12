import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useGetMeQuery, useUpdateMutation } from '../../api/profileApi';
import {
  useGetFavouritesQuery,
  useGetWatchlistQuery,
  useListPlaylistsQuery,
} from '../../api/libraryApi';
import { usePlaylistActions } from '../../hooks/usePlaylistActions';
import { usePageMeta } from '../../hooks/usePageMeta';
import { LoadingState } from '../../components/state';
import { MovieGrid } from '../../components/movie/MovieGrid';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAppDispatch } from '../../store/hooks';
import { pushToast } from '../../store/uiSlice';
import { IMAGE_MIME_TYPES, IMAGE_MAX_BYTES } from '../../lib/constants';
import type { Playlist } from '../../api/types';
import { useAuth } from '../../hooks/useAuth';

export default function ProfilePage() {
  usePageMeta('Profile');
  const { data, isLoading } = useGetMeQuery();
  const user = data?.user;
  const { user: authUser } = useAuth();

  const favourites = useGetFavouritesQuery();
  const watchlist = useGetWatchlistQuery();
  const playlists = useListPlaylistsQuery();
  const { removeFrom } = usePlaylistActions();

  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading || !user) return <LoadingState />;

  const favItems = favourites.data?.playlist?.items ?? [];
  const watchItems = watchlist.data?.playlist?.items ?? [];
  const custom = (playlists.data?.playlists ?? []).filter((p: Playlist) => !p.isSystem);

  return (
    <Box>
      {/* Cover + avatar header */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          height: 200,
          mb: 2,
          backgroundImage: user.coverPic
            ? `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2)), url(${user.coverPic})`
            : 'linear-gradient(135deg, #1c2230 0%, #141821 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Avatar
          src={user.profilePic || undefined}
          sx={{ position: 'absolute', bottom: -36, left: 24, width: 88, height: 88, border: '4px solid', borderColor: 'background.default' }}
        >
          {(user.name || authUser?.email || '?').charAt(0).toUpperCase()}
        </Avatar>
      </Box>

      <PageHeader
        title={user.name || authUser?.email || 'KinoList member'}
        subtitle={user.bio || 'No bio yet'}
        action={
          <Button variant="outlined" onClick={() => setEditOpen(true)}>
            Edit profile
          </Button>
        }
      />

      {/* Library tabs (profile hosts the library, per §7.7) */}
      <Tabs value={tab} onChange={(_e, v: number) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={`Favourites (${favItems.length})`} />
        <Tab label={`Watchlist (${watchItems.length})`} />
        <Tab label={`Playlists (${custom.length})`} />
      </Tabs>

      {tab === 0 && (
        <ProfileMovieGrid
          movies={favItems}
          onRemove={(imdbId, title) => favourites.data?.playlist && removeFrom(favourites.data.playlist.id, imdbId, title)}
        />
      )}
      {tab === 1 && (
        <ProfileMovieGrid
          movies={watchItems}
          onRemove={(imdbId, title) => watchlist.data?.playlist && removeFrom(watchlist.data.playlist.id, imdbId, title)}
        />
      )}
      {tab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {custom.length === 0 ? (
            <Typography color="text.secondary">No custom playlists yet.</Typography>
          ) : (
            custom.map((p) => (
              <Typography key={p.id}>
                • <strong>{p.name}</strong> — {p.itemCount} items
              </Typography>
            ))
          )}
        </Box>
      )}

      <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} user={user} />
    </Box>
  );
}

function ProfileMovieGrid({
  movies,
  onRemove,
}: {
  movies: { imdbId: string; title: string; posterUrl: string }[];
  onRemove: (imdbId: string, title: string) => void;
}) {
  if (movies.length === 0) {
    return <Typography color="text.secondary">Nothing here yet.</Typography>;
  }
  return (
    <MovieGrid
      movies={movies.map((m) => ({ imdbId: m.imdbId, title: m.title, year: '', type: '', posterUrl: m.posterUrl }))}
      footer={(movie) => (
        <Box sx={{ px: 1, pb: 1 }}>
          <Button size="small" color="error" onClick={() => onRemove(movie.imdbId, movie.title)}>
            Remove
          </Button>
        </Box>
      )}
    />
  );
}

function EditProfileDialog({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: { name: string; bio: string; profilePic: string; coverPic: string };
}) {
  const [update] = useUpdateMutation();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [coverPic, setCoverPic] = useState<File | null>(null);
  const [fieldError, setFieldError] = useState<Record<string, string>>({});

  const validateFile = (file: File): string | null => {
    if (!IMAGE_MIME_TYPES.includes(file.type)) return 'Only JPEG, PNG, GIF, or WEBP images are allowed.';
    if (file.size > IMAGE_MAX_BYTES) return 'Image must be 5 MB or smaller.';
    return null;
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (profilePic) {
      const err = validateFile(profilePic);
      if (err) errors.profilePic = err;
    }
    if (coverPic) {
      const err = validateFile(coverPic);
      if (err) errors.coverPic = err;
    }
    setFieldError(errors);
    if (Object.keys(errors).length) return;

    const res = await update({
      name: name.trim(),
      bio: bio.trim(),
      profilePic: profilePic ?? undefined,
      coverPic: coverPic ?? undefined,
    });
    if ('error' in res) {
      const msg = (res.error as { data?: { error?: { message?: string } } })?.data?.error?.message;
      dispatch(pushToast({ message: msg ?? 'Could not save profile', severity: 'error' }));
      return;
    }
    dispatch(pushToast({ message: 'Profile updated', severity: 'success' }));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          label="Bio"
          fullWidth
          multiline
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          sx={{ mb: 2 }}
        />
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#9aa4bb' }}>
          Profile picture
        </label>
        <input type="file" accept={IMAGE_MIME_TYPES.join(',')} onChange={(e) => setProfilePic(e.target.files?.[0] ?? null)} />
        {fieldError.profilePic && (
          <Typography variant="caption" color="error">{fieldError.profilePic}</Typography>
        )}
        <Box sx={{ mb: 2 }} />
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#9aa4bb' }}>
          Cover picture
        </label>
        <input type="file" accept={IMAGE_MIME_TYPES.join(',')} onChange={(e) => setCoverPic(e.target.files?.[0] ?? null)} />
        {fieldError.coverPic && (
          <Typography variant="caption" color="error">{fieldError.coverPic}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
