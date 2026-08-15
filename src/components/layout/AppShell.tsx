import { useState, type ReactNode } from 'react';
import {
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TheatersRoundedIcon from '@mui/icons-material/TheatersRounded';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useSessionBootstrap } from '../../hooks/useAuth';
import { useGetMeQuery } from '../../api/profileApi';
import { useAppDispatch } from '../../store/hooks';
import { logoutLocal } from '../../store/authSlice';
import { authApi, useLogoutMutation } from '../../api/authApi';
import { pushToast } from '../../store/uiSlice';

const RAIL_WIDTH = 82;

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  protected?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: <HomeRoundedIcon /> },
  { to: '/search', label: 'Explore', icon: <SearchRoundedIcon /> },
  { to: '/recommendations', label: 'For you', icon: <AutoAwesomeRoundedIcon />, protected: true },
  { to: '/library', label: 'Library', icon: <BookmarkBorderRoundedIcon />, protected: true },
];

export function AppShell() {
  useSessionBootstrap();
  const { isAuthenticated, user } = useAuth();
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);
  const { data: profileData } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const navItems = PRIMARY_NAV.filter((item) => !item.protected || isAuthenticated);
  const displayName = profileData?.user?.name || user?.email || 'Account';
  const avatarUrl = profileData?.user?.profilePic || undefined;

  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = async () => {
    try { await logout(undefined).unwrap(); } catch { /* local logout still applies */ }
    dispatch(logoutLocal());
    dispatch(authApi.util.resetApiState());
    dispatch(pushToast({ message: 'Logged out', severity: 'info' }));
    setAccountAnchor(null);
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Box
          component="aside"
          sx={{
            position: 'fixed', inset: 0, right: 'auto', zIndex: (value) => value.zIndex.appBar + 1,
            width: RAIL_WIDTH, display: 'flex', flexDirection: 'column', alignItems: 'center',
            bgcolor: 'rgba(5,5,13,.97)', borderRight: 1, borderColor: 'divider',
          }}
        >
          <Logo />
          <Divider flexItem />
          <Box component="nav" aria-label="Main navigation" sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 1, py: 2 }}>
            {navItems.map((item) => (
              <RailButton key={item.to} item={item} active={isActive(item.to)} />
            ))}
          </Box>
          <Box sx={{ pb: 2 }}>
            {isAuthenticated ? (
              <Tooltip title={displayName} placement="right" arrow>
                <IconButton aria-label="Open account menu" onClick={(event) => setAccountAnchor(event.currentTarget)}>
                  <Avatar src={avatarUrl} alt={`${displayName} profile picture`} sx={{ width: 42, height: 42, bgcolor: 'primary.dark', fontWeight: 900, border: '2px solid', borderColor: 'primary.main' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Sign in" placement="right"><IconButton component={Link} to="/login"><LoginRoundedIcon /></IconButton></Tooltip>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ ml: { md: `${RAIL_WIDTH}px` }, minHeight: '100vh', display: 'flex', flexDirection: 'column', pb: { xs: 9, md: 0 } }}>
        <Container component="main" maxWidth={false} sx={{ flex: 1, px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, md: 3 } }}>
          <Outlet />
        </Container>
        <Box component="footer" sx={{ py: 2.5, px: 3, textAlign: 'center', color: 'text.secondary', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption">KinoList · discover, organise, remember.</Typography>
        </Box>
      </Box>

      {isMobile && (
        <Box
          component="nav"
          aria-label="Mobile navigation"
          sx={{
            position: 'fixed', zIndex: (value) => value.zIndex.appBar + 2, left: 12, right: 12, bottom: 10,
            height: 68, px: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'center',
            bgcolor: 'rgba(12,10,24,.95)', backdropFilter: 'blur(20px)', border: 1, borderColor: 'rgba(184,126,255,.26)',
            borderRadius: 4, boxShadow: '0 14px 45px rgba(0,0,0,.55)',
          }}
        >
          <MobileNavButton item={PRIMARY_NAV[0]} active={isActive('/')} />
          <MobileNavButton item={PRIMARY_NAV[1]} active={isActive('/search')} />
          <MobileNavButton item={PRIMARY_NAV[2]} active={isActive('/recommendations')} elevated disabled={!isAuthenticated} />
          <MobileNavButton item={PRIMARY_NAV[3]} active={isActive('/library')} disabled={!isAuthenticated} />
          {isAuthenticated ? (
            <IconButton aria-label="Account" onClick={(event) => setAccountAnchor(event.currentTarget)} sx={{ mx: 'auto', color: isActive('/profile') || isActive('/settings') ? 'primary.light' : 'text.secondary' }}>
              <Avatar src={avatarUrl} alt={`${displayName} profile picture`} sx={{ width: 30, height: 30, bgcolor: 'primary.dark', fontSize: 13 }}>{displayName.charAt(0).toUpperCase()}</Avatar>
            </IconButton>
          ) : (
            <IconButton component={Link} to="/login" aria-label="Sign in" sx={{ mx: 'auto' }}><PersonOutlineRoundedIcon /></IconButton>
          )}
        </Box>
      )}

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
        anchorOrigin={{ vertical: isMobile ? 'top' : 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: isMobile ? 'bottom' : 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ px: 2, py: 1, maxWidth: 240 }}><Typography variant="body2" fontWeight={800} noWrap>{displayName}</Typography><Typography variant="caption" color="text.secondary" noWrap display="block">{user?.email}</Typography></Box>
        <Divider />
        <MenuItem component={Link} to="/profile" onClick={() => setAccountAnchor(null)}>View profile</MenuItem>
        <MenuItem component={Link} to="/settings" onClick={() => setAccountAnchor(null)}>Settings & security</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} disabled={isLoading}>Log out</MenuItem>
      </Menu>
    </Box>
  );
}

function RailButton({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Tooltip title={item.label} placement="right" arrow>
      <IconButton component={Link} to={item.to} aria-label={item.label} sx={{ width: 46, height: 46, color: active ? 'primary.light' : 'text.secondary', bgcolor: active ? 'rgba(155,92,255,.16)' : 'transparent', border: '1px solid', borderColor: active ? 'rgba(155,92,255,.32)' : 'transparent', '&:hover': { bgcolor: 'rgba(155,92,255,.12)', color: 'primary.light' } }}>
        {item.icon}
      </IconButton>
    </Tooltip>
  );
}

function MobileNavButton({ item, active, elevated = false, disabled = false }: { item: NavItem; active: boolean; elevated?: boolean; disabled?: boolean }) {
  return (
    <IconButton
      component={disabled ? 'button' : Link}
      {...(!disabled ? { to: item.to } : {})}
      disabled={disabled}
      aria-label={item.label}
      sx={{
        mx: 'auto', width: elevated ? 54 : 44, height: elevated ? 54 : 44, mt: elevated ? -4 : 0,
        color: active || elevated ? '#fff' : 'text.secondary',
        bgcolor: elevated ? 'primary.main' : active ? 'rgba(155,92,255,.16)' : 'transparent',
        backgroundImage: elevated ? 'linear-gradient(135deg, #7a3cff, #ec3dff)' : 'none',
        border: elevated ? '5px solid #0c0a18' : '1px solid transparent',
        boxShadow: elevated ? '0 8px 24px rgba(146,84,255,.5)' : 'none',
        '&:hover': { bgcolor: elevated ? 'primary.main' : 'rgba(155,92,255,.13)' },
      }}
    >{item.icon}</IconButton>
  );
}

function Logo() {
  return (
    <Box component={Link} to="/" aria-label="KinoList home" sx={{ minHeight: 66, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'text.primary', textDecoration: 'none' }}>
      <Box sx={{ display: 'grid', width: 36, height: 36, placeItems: 'center', borderRadius: 2.5, color: '#fff', background: 'linear-gradient(135deg, #7a3cff, #ec3dff)', boxShadow: '0 0 24px rgba(155,92,255,.32)' }}><TheatersRoundedIcon fontSize="small" /></Box>
    </Box>
  );
}
