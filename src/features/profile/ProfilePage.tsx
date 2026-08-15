import { Avatar, Box, Button, Card, Skeleton, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import Grid2 from '@mui/material/Grid2';
import { Link } from 'react-router-dom';
import { useGetMeQuery } from '../../api/profileApi';
import { useGetFavouritesQuery, useGetPlaylistQuery, useGetWatchlistQuery, useListPlaylistsQuery } from '../../api/libraryApi';
import type { Playlist, PlaylistItem } from '../../api/types';
import { LoadingState } from '../../components/state';
import { usePageMeta } from '../../hooks/usePageMeta';

export default function ProfilePage() {
  usePageMeta('Profile');
  const { data, isLoading } = useGetMeQuery();
  const favourites = useGetFavouritesQuery();
  const watchlist = useGetWatchlistQuery();
  const playlists = useListPlaylistsQuery();
  const user = data?.user;

  if (isLoading || !user) return <LoadingState />;

  const name = user.name || 'KinoList member';
  const custom = (playlists.data?.playlists ?? []).filter((playlist) => !playlist.isSystem && playlist.itemCount > 0);
  const favouritePlaylist = favourites.data?.playlist;
  const watchlistPlaylist = watchlist.data?.playlist;
  const totalSaved = (favouritePlaylist?.itemCount ?? 0) + (watchlistPlaylist?.itemCount ?? 0) + custom.reduce((sum, playlist) => sum + playlist.itemCount, 0);
  const collectionCount = custom.length + Number((favouritePlaylist?.itemCount ?? 0) > 0) + Number((watchlistPlaylist?.itemCount ?? 0) > 0);

  return (
    <Box sx={{ mx: { xs: -2, sm: -3, lg: -4 }, mt: { xs: -2.5, md: -3 }, overflow: 'hidden' }}>
      <Box component="section" sx={{ position: 'relative', minHeight: { xs: 500, sm: 460, lg: 500 }, display: 'flex', alignItems: 'flex-end', px: { xs: 2, sm: 4, lg: 6 }, pb: { xs: 6, sm: 7, lg: 8 }, backgroundColor: '#100b20', backgroundImage: user.coverPic ? `url("${user.coverPic}")` : 'radial-gradient(circle at 80% 12%, rgba(130,65,255,.48), transparent 32%), radial-gradient(circle at 58% 48%, rgba(73,33,139,.42), transparent 35%), linear-gradient(120deg, #0b0817, #251044 66%, #10091d)', backgroundSize: 'cover', backgroundPosition: 'center 34%' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,7,17,.91) 0%, rgba(7,7,17,.48) 40%, rgba(7,7,17,.08) 75%), linear-gradient(0deg, #070711 0%, rgba(7,7,17,.92) 8%, rgba(7,7,17,.2) 52%, rgba(7,7,17,.16) 100%)' }} />
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: -2, height: 130, background: 'linear-gradient(0deg, #070711 0%, rgba(7,7,17,.9) 28%, transparent 100%)' }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={{ xs: 1.6, sm: 2.8 }} sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <Avatar src={user.profilePic || undefined} alt={`${name} profile picture`} sx={{ width: { xs: 112, sm: 142, lg: 158 }, height: { xs: 112, sm: 142, lg: 158 }, border: '5px solid rgba(7,7,17,.92)', outline: '1px solid rgba(190,145,255,.45)', bgcolor: 'primary.dark', fontSize: { xs: 42, sm: 56 }, boxShadow: '0 18px 55px rgba(0,0,0,.6), 0 0 30px rgba(125,61,255,.16)' }}>{name.charAt(0).toUpperCase()}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0, pb: { sm: 1 } }}>
            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2rem', sm: '2.6rem', lg: '3rem' }, lineHeight: 1.05, textShadow: '0 4px 24px rgba(0,0,0,.7)' }}>{name}</Typography>
          </Box>
          <Button component={Link} to="/settings#profile" variant="contained" startIcon={<EditRoundedIcon />} sx={{ mb: { sm: 1.4 }, px: 2.7, borderRadius: 999, backgroundImage: 'linear-gradient(135deg, #7136ff, #a342ff)', boxShadow: '0 10px 32px rgba(119,56,255,.32)' }}>Edit profile</Button>
        </Stack>
      </Box>

      <Box sx={{ position: 'relative', px: { xs: 2, sm: 3, lg: 5 }, pb: 6 }}>
        <Grid2 container spacing={2.5} sx={{ mb: { xs: 5, md: 7 } }}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: { xs: 2.2, sm: 2.8 }, height: '100%', display: 'grid', gridTemplateColumns: '52px minmax(0, 1fr)', gap: 1.7, alignItems: 'start', background: 'linear-gradient(145deg, rgba(22,17,39,.96), rgba(10,9,19,.96))', borderColor: 'rgba(190,145,255,.18)' }}>
              <Box sx={{ width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: 2.5, bgcolor: 'rgba(146,84,255,.15)', color: 'primary.light' }}><InfoRoundedIcon /></Box>
              <Box><Typography variant="overline" color="primary.light" fontWeight={900}>ABOUT</Typography><Typography color="text.secondary" sx={{ mt: .45, lineHeight: 1.65 }}>{user.bio || 'This member has not added a bio yet.'}</Typography></Box>
            </Card>
          </Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><ProfileStat icon={<BookmarkRoundedIcon />} label="Saved titles" value={totalSaved} /></Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}><ProfileStat icon={<CollectionsBookmarkRoundedIcon />} label="Collections" value={collectionCount} /></Grid2>
        </Grid2>

        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'end' }} justifyContent="space-between" spacing={2} sx={{ mb: 3.5 }}>
          <Box><Typography variant="h3" component="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.3rem' } }}>Collections</Typography><Box sx={{ width: 44, height: 3, borderRadius: 99, bgcolor: 'primary.main', my: 1 }} /><Typography color="text.secondary" variant="body2">Favourites, watchlist, and every list you have created.</Typography></Box>
          <Button component={Link} to="/library" variant="outlined" startIcon={<AddRoundedIcon />} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' }, borderRadius: 999, px: 2.4 }}>New collection</Button>
        </Stack>

        <Grid2 container spacing={{ xs: 3, md: 4 }}>
          {favouritePlaylist && favouritePlaylist.itemCount > 0 && <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}><CollectionStackCard playlist={favouritePlaylist} to="/library/favourites" icon={<FavoriteRoundedIcon />} accent="#a653ff" /></Grid2>}
          {watchlistPlaylist && watchlistPlaylist.itemCount > 0 && <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}><CollectionStackCard playlist={watchlistPlaylist} to="/library/watchlist" icon={<BookmarkRoundedIcon />} accent="#8d4dff" /></Grid2>}
          {custom.map((playlist) => <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} key={playlist.id}><CustomCollectionCard playlist={playlist} /></Grid2>)}
        </Grid2>
      </Box>
    </Box>
  );
}

function CustomCollectionCard({ playlist }: { playlist: Playlist }) {
  const detail = useGetPlaylistQuery(playlist.id);
  const resolved = detail.data?.playlist ?? playlist;
  if (detail.isLoading) return <Skeleton variant="rounded" height={350} sx={{ bgcolor: 'rgba(146,84,255,.07)' }} />;
  if (resolved.itemCount === 0) return null;
  return <CollectionStackCard playlist={resolved} to={`/library/playlists/${playlist.id}`} icon={<CollectionsBookmarkRoundedIcon />} accent="#26c9bb" />;
}

function CollectionStackCard({ playlist, to, icon, accent }: { playlist: Playlist; to: string; icon: React.ReactNode; accent: string }) {
  const posters = playlist.items?.slice(0, 5) ?? [];
  return (
    <Box
      component={Link}
      to={to}
      aria-label={`Open ${playlist.name} collection`}
      sx={{
        position: 'relative', display: 'block', height: { xs: 315, sm: 345 }, color: 'inherit', textDecoration: 'none',
        filter: 'drop-shadow(0 22px 30px rgba(0,0,0,.38))',
        transition: 'transform .28s ease, filter .28s ease',
        '&:hover': { transform: 'translateY(-8px)', filter: `drop-shadow(0 28px 40px rgba(0,0,0,.5)) drop-shadow(0 0 22px ${accent}24)` },
        '&:hover .stack-poster': { transform: 'var(--poster-transform) translateY(-8px)' },
        '&:focus-visible': { outline: `2px solid ${accent}`, outlineOffset: 6, borderRadius: 3 },
      }}
    >
      <Box sx={{ position: 'absolute', inset: '0 7% 62px', background: `radial-gradient(ellipse at 50% 75%, ${accent}22, transparent 63%)`, pointerEvents: 'none' }} />

      {posters.length ? posters.map((item, index) => <StackPoster key={item.imdbId} item={item} index={index} count={posters.length} />) : (
        <>
          {[-1, 0, 1].map((offset, index) => (
            <Box key={offset} className="stack-poster" sx={{ '--poster-transform': `translateX(-50%) rotate(${offset * 7}deg)`, position: 'absolute', left: `calc(50% + ${offset * 46}px)`, bottom: 91, width: { xs: 118, sm: 140 }, height: { xs: 178, sm: 216 }, display: 'grid', placeItems: 'center', borderRadius: 2.5, color: index === 1 ? accent : `${accent}99`, bgcolor: index === 1 ? `${accent}1f` : '#151020', border: '1px solid', borderColor: `${accent}55`, boxShadow: '0 12px 28px rgba(0,0,0,.48)', transform: `translateX(-50%) rotate(${offset * 7}deg)`, transformOrigin: 'bottom center', transition: 'transform .28s ease', zIndex: index + 1 }}>{index === 1 && icon}</Box>
          ))}
        </>
      )}

      <Box sx={{ position: 'absolute', left: { xs: '6%', sm: '5%' }, right: { xs: '6%', sm: '5%' }, bottom: 28, height: { xs: 90, sm: 96 }, display: 'grid', placeItems: 'center', px: 2, borderRadius: '13px 13px 7px 7px', color: 'primary.light', background: `linear-gradient(155deg, ${accent}22, #160d29 42%, #100b20)`, border: '1px solid', borderColor: `${accent}aa`, boxShadow: `inset 0 1px 0 ${accent}55, inset 0 -16px 28px rgba(0,0,0,.22), 0 15px 34px rgba(0,0,0,.46), 0 0 22px ${accent}16`, zIndex: 8 }}>
        <Box sx={{ textAlign: 'center', minWidth: 0 }}>
          <Typography variant="h5" component="h3" fontWeight={900} noWrap>{playlist.name}</Typography>
          <Typography variant="caption" color="text.secondary">{playlist.itemCount} title{playlist.itemCount === 1 ? '' : 's'}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function StackPoster({ item, index, count }: { item: PlaylistItem; index: number; count: number }) {
  const offset = index - (count - 1) / 2;
  const rotation = offset * (count >= 4 ? 5 : 7);
  const spread = count >= 5 ? 39 : count === 4 ? 44 : 52;
  const translate = 'translateX(-50%)';
  return <Box className="stack-poster" component="img" src={item.posterUrl || undefined} alt="" loading="lazy" decoding="async" sx={{ '--poster-transform': `${translate} rotate(${rotation}deg)`, position: 'absolute', left: `calc(50% + ${offset * spread}px)`, bottom: 87, width: { xs: count === 1 ? 138 : 112, sm: count === 1 ? 154 : 126 }, height: { xs: 204, sm: 226 }, objectFit: 'cover', borderRadius: 2.5, border: '3px solid #100b1d', boxShadow: '0 15px 34px rgba(0,0,0,.58)', transform: `${translate} rotate(${rotation}deg)`, transformOrigin: 'bottom center', transition: 'transform .28s ease', zIndex: index + 1 }} />;
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <Card sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', display: 'flex', gap: 1.5, alignItems: 'center', background: 'linear-gradient(145deg, rgba(22,17,39,.96), rgba(10,9,19,.96))', borderColor: 'rgba(190,145,255,.18)' }}><Box sx={{ flexShrink: 0, width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: 2.5, bgcolor: 'rgba(146,84,255,.15)', color: 'primary.light' }}>{icon}</Box><Box><Typography variant="h4" component="p" color="primary.light" lineHeight={1}>{value}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .65 }}>{label}</Typography></Box></Card>;
}
