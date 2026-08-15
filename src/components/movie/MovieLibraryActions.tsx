import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import { useNavigate } from 'react-router-dom';
import type { MovieSummary, Playlist } from '../../api/types';
import { useGetFavouritesQuery, useGetWatchlistQuery, useListPlaylistsQuery } from '../../api/libraryApi';
import { useAuth } from '../../hooks/useAuth';
import { usePlaylistActions } from '../../hooks/usePlaylistActions';

export function MovieLibraryActions({ movie, variant = 'compact' }: { movie: MovieSummary; variant?: 'compact' | 'card' }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const favourites = useGetFavouritesQuery(undefined, { skip: !isAuthenticated });
  const watchlist = useGetWatchlistQuery(undefined, { skip: !isAuthenticated });
  const playlists = useListPlaylistsQuery(undefined, { skip: !isAuthenticated });
  const { addTo, removeFrom, create } = usePlaylistActions();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [favouriteOverride, setFavouriteOverride] = useState<boolean | null>(null);
  const [watchlistOverride, setWatchlistOverride] = useState<boolean | null>(null);
  const [customOverrides, setCustomOverrides] = useState<Record<string, boolean>>({});

  const favouritePlaylist = favourites.data?.playlist;
  const watchlistPlaylist = watchlist.data?.playlist;
  const serverFavourite = !!favouritePlaylist?.items?.some((item) => item.imdbId === movie.imdbId);
  const serverWatchlist = !!watchlistPlaylist?.items?.some((item) => item.imdbId === movie.imdbId);
  const isFavourite = favouriteOverride ?? serverFavourite;
  const isWatchlist = watchlistOverride ?? serverWatchlist;
  const customPlaylists = (playlists.data?.playlists ?? []).filter((playlist) => !playlist.isSystem);
  const serverCustomSaved = customPlaylists.filter((playlist) => playlist.itemIds?.includes(movie.imdbId)).map((playlist) => playlist.id);
  const selectedCustomIds = new Set([
    ...serverCustomSaved.filter((id) => customOverrides[id] !== false),
    ...Object.entries(customOverrides).filter(([, selected]) => selected).map(([id]) => id),
  ]);
  const isSaved = isWatchlist || selectedCustomIds.size > 0;
  const cardVariant = variant === 'card';

  useEffect(() => setFavouriteOverride(null), [serverFavourite]);
  useEffect(() => setWatchlistOverride(null), [serverWatchlist]);

  const requireAccount = () => {
    if (isAuthenticated) return true;
    navigate('/login');
    return false;
  };

  const toggleFavourite = async () => {
    if (!requireAccount() || !favouritePlaylist) return;
    const previous = isFavourite;
    const next = !previous;
    setFavouriteOverride(next);
    const ok = next
      ? await addTo(favouritePlaylist.id, movie)
      : await removeFrom(favouritePlaylist.id, movie.imdbId, movie.title);
    if (!ok) setFavouriteOverride(previous);
  };

  const toggleWatchlist = async () => {
    if (!watchlistPlaylist) return;
    const previous = isWatchlist;
    const next = !previous;
    setWatchlistOverride(next);
    const ok = next
      ? await addTo(watchlistPlaylist.id, movie)
      : await removeFrom(watchlistPlaylist.id, movie.imdbId, movie.title);
    if (!ok) setWatchlistOverride(previous);
  };

  const toggleCustom = async (playlist: Playlist) => {
    const previous = selectedCustomIds.has(playlist.id);
    const next = !previous;
    setCustomOverrides((current) => ({ ...current, [playlist.id]: next }));
    setMenuAnchor(null);
    const ok = next
      ? await addTo(playlist.id, movie)
      : await removeFrom(playlist.id, movie.imdbId, movie.title);
    if (!ok) setCustomOverrides((current) => ({ ...current, [playlist.id]: previous }));
  };

  const createAndAdd = async () => {
    if (!newName.trim()) return;
    const playlist = await create(newName.trim());
    if (!playlist) return;
    const ok = await addTo(playlist.id, movie);
    if (ok) setCustomOverrides((current) => ({ ...current, [playlist.id]: true }));
    setNewName('');
    setCreateOpen(false);
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: cardVariant ? .85 : .75, alignItems: 'center' }}>
        <Tooltip title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}>
          <IconButton
            aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            onClick={toggleFavourite}
            size={cardVariant ? 'medium' : 'small'}
            sx={{
              width: cardVariant ? 42 : 34, height: cardVariant ? 42 : 34,
              color: isFavourite ? 'primary.light' : '#fff', backdropFilter: 'blur(10px)',
              bgcolor: isFavourite ? 'rgba(146,84,255,.2)' : 'rgba(12,10,22,.88)',
              backgroundImage: 'none',
              border: '1px solid', borderColor: isFavourite ? 'primary.light' : 'rgba(197,169,255,.32)',
              boxShadow: 'none',
              '&:hover': { bgcolor: isFavourite ? 'rgba(146,84,255,.3)' : 'rgba(38,27,62,.96)', borderColor: 'primary.light' },
              transition: 'background-color .2s ease, border-color .2s ease, color .2s ease',
            }}
          >
            {isFavourite ? <FavoriteRoundedIcon sx={{ fontSize: cardVariant ? 21 : 20 }} /> : <FavoriteBorderRoundedIcon sx={{ fontSize: cardVariant ? 21 : 20 }} />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Save to collection">
          <IconButton
            aria-label="Save to collection"
            onClick={(event) => { if (requireAccount()) setMenuAnchor(event.currentTarget); }}
            size={cardVariant ? 'medium' : 'small'}
            sx={{
              width: cardVariant ? 42 : 34, height: cardVariant ? 42 : 34,
              bgcolor: isSaved ? 'rgba(146,84,255,.2)' : 'rgba(12,10,22,.88)', color: isSaved ? 'primary.light' : '#fff', backdropFilter: 'blur(10px)',
              border: 1, borderColor: isSaved ? 'primary.light' : 'rgba(197,169,255,.32)',
              boxShadow: 'none',
              '&:hover': { bgcolor: isSaved ? 'rgba(146,84,255,.3)' : 'rgba(38,27,62,.96)', borderColor: 'primary.light' },
            }}
          >
            {isSaved ? <BookmarkRoundedIcon fontSize="small" /> : <BookmarkBorderRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} slotProps={{ paper: { sx: { minWidth: 260, mt: .5 } } }}>
        <MenuItem onClick={toggleWatchlist}>
          <ListItemIcon>{isWatchlist ? <CheckRoundedIcon color="primary" /> : <BookmarkBorderRoundedIcon />}</ListItemIcon>
          <ListItemText primary="Watchlist" secondary={isWatchlist ? 'Saved' : 'Watch later'} />
        </MenuItem>
        {customPlaylists.length > 0 && <Divider />}
        {customPlaylists.map((playlist) => (
          <MenuItem key={playlist.id} onClick={() => toggleCustom(playlist)}>
            <ListItemIcon>{selectedCustomIds.has(playlist.id) ? <CheckRoundedIcon color="primary" /> : <PlaylistAddRoundedIcon />}</ListItemIcon>
            <ListItemText primary={playlist.name} secondary={`${playlist.itemCount} item${playlist.itemCount === 1 ? '' : 's'}`} />
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => { setMenuAnchor(null); setCreateOpen(true); }}>
          <ListItemIcon><AddRoundedIcon /></ListItemIcon><ListItemText primary="New collection" />
        </MenuItem>
      </Menu>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create a collection</DialogTitle>
        <DialogContent><TextField autoFocus fullWidth label="Collection name" value={newName} onChange={(event) => setNewName(event.target.value)} inputProps={{ maxLength: 80 }} sx={{ mt: 1 }} /></DialogContent>
        <DialogActions><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="contained" disabled={!newName.trim()} onClick={createAndAdd}>Create & save</Button></DialogActions>
      </Dialog>
    </>
  );
}
