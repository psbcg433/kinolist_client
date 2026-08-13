import { useState, type ReactNode } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TheatersRoundedIcon from '@mui/icons-material/TheatersRounded';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useSessionBootstrap } from '../../hooks/useAuth';
import { useAppDispatch } from '../../store/hooks';
import { logoutLocal } from '../../store/authSlice';
import { authApi, useLogoutMutation } from '../../api/authApi';
import { useGetSummaryQuery } from '../../api/libraryApi';
import { pushToast } from '../../store/uiSlice';

const RAIL_WIDTH = 82;

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  protected?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: <HomeRoundedIcon /> },
  { to: '/search', label: 'Explore', icon: <SearchRoundedIcon /> },
  { to: '/recommendations', label: 'For you', icon: <AutoAwesomeRoundedIcon />, protected: true },
  { to: '/library', label: 'Library', icon: <BookmarkBorderRoundedIcon />, protected: true },
  { to: '/profile', label: 'Profile', icon: <PersonOutlineRoundedIcon />, protected: true },
  { to: '/settings', label: 'Settings', icon: <SettingsOutlinedIcon />, protected: true },
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
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);
  const { data: summaryData } = useGetSummaryQuery(undefined, { skip: !isAuthenticated });
  const watchlistCount = summaryData?.summary?.watchlistCount ?? 0;
  const navItems = NAV_ITEMS.filter((item) => !item.protected || isAuthenticated);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const closeMenus = () => {
    setAccountAnchor(null);
    setMobileAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
    } catch {
      // Local credentials still need clearing when the network request fails.
    }
    dispatch(logoutLocal());
    dispatch(authApi.util.resetApiState());
    dispatch(pushToast({ message: 'Logged out', severity: 'info' }));
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Box
          component="aside"
          sx={{
            position: 'fixed',
            inset: 0,
            right: 'auto',
            zIndex: (value) => value.zIndex.appBar + 1,
            width: RAIL_WIDTH,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'rgba(5,6,13,.96)',
            borderRight: 1,
            borderColor: 'divider',
          }}
        >
          <Logo compact />
          <Divider flexItem />
          <Box component="nav" aria-label="Main navigation" sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 1, py: 2 }}>
            {navItems.map((item) => (
              <Tooltip key={item.to} title={item.label} placement="right" arrow>
                <IconButton
                  component={Link}
                  to={item.to}
                  aria-label={item.label}
                  sx={{
                    width: 46,
                    height: 46,
                    color: isActive(item.to) ? 'primary.light' : 'text.secondary',
                    bgcolor: isActive(item.to) ? 'rgba(155,92,255,.16)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive(item.to) ? 'rgba(155,92,255,.32)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(155,92,255,.12)', color: 'primary.light' },
                  }}
                >
                  {item.to === '/library' ? (
                    <Badge badgeContent={watchlistCount} color="secondary" max={99}>{item.icon}</Badge>
                  ) : item.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
          <Box sx={{ pb: 2 }}>
            {isAuthenticated ? (
              <IconButton aria-label="Open account menu" onClick={(event) => setAccountAnchor(event.currentTarget)}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.dark', fontWeight: 900 }}>
                  {user?.email?.charAt(0).toUpperCase() ?? '?'}
                </Avatar>
              </IconButton>
            ) : (
              <Tooltip title="Sign in" placement="right"><IconButton component={Link} to="/login"><PersonOutlineRoundedIcon /></IconButton></Tooltip>
            )}
          </Box>
        </Box>
      )}

      <AppBar position="fixed" elevation={0} sx={{ left: { md: RAIL_WIDTH }, width: { md: `calc(100% - ${RAIL_WIDTH}px)` } }}>
        <Toolbar sx={{ minHeight: { xs: 64, md: 66 }, px: { xs: 2, md: 3 } }}>
          {isMobile ? <Logo /> : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Explore the world of cinema</Typography>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'secondary.main', boxShadow: '0 0 12px currentColor' }} />
            </Box>
          )}
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Search movies">
            <IconButton component={Link} to="/search" color="inherit"><SearchRoundedIcon /></IconButton>
          </Tooltip>
          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={(event) => setMobileAnchor(event.currentTarget)}><MenuRoundedIcon /></IconButton>
              <Menu anchorEl={mobileAnchor} open={Boolean(mobileAnchor)} onClose={closeMenus}>
                {navItems.map((item) => <MenuItem key={item.to} component={Link} to={item.to} onClick={closeMenus} selected={isActive(item.to)}>{item.label}</MenuItem>)}
                {isAuthenticated ? <MenuItem onClick={handleLogout} disabled={isLoading}>Log out</MenuItem> : <MenuItem component={Link} to="/login" onClick={closeMenus}>Sign in</MenuItem>}
              </Menu>
            </>
          ) : isAuthenticated ? (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, maxWidth: 190 }} noWrap>{user?.email}</Typography>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
              <Button component={Link} to="/login" color="inherit" size="small">Sign in</Button>
              <Button component={Link} to="/register" variant="contained" size="small">Join now</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ ml: { md: `${RAIL_WIDTH}px` }, pt: { xs: '64px', md: '66px' }, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container component="main" maxWidth={false} sx={{ flex: 1, px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, md: 3 } }}>
          <Outlet />
        </Container>
        <Box component="footer" sx={{ py: 2.5, px: 3, textAlign: 'center', color: 'text.secondary', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption">KinoList · discover, organise, remember.</Typography>
        </Box>
      </Box>

      <Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={closeMenus} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <MenuItem component={Link} to="/profile" onClick={closeMenus}>Profile</MenuItem>
        <MenuItem component={Link} to="/settings/security" onClick={closeMenus}>Security</MenuItem>
        <MenuItem onClick={handleLogout} disabled={isLoading}>Log out</MenuItem>
      </Menu>
    </Box>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Box component={Link} to="/" sx={{ minHeight: compact ? 66 : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 1, px: compact ? 0 : 0.5, color: 'text.primary', textDecoration: 'none', flexShrink: 0 }}>
      <Box sx={{ display: 'grid', width: 36, height: 36, placeItems: 'center', borderRadius: 2.5, color: '#fff', background: 'linear-gradient(135deg, #7a3cff, #ec3dff)', boxShadow: '0 0 24px rgba(155,92,255,.32)' }}>
        <TheatersRoundedIcon fontSize="small" />
      </Box>
      {!compact && <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-.045em' }}>Kino<span style={{ color: '#c778ff' }}>List</span></Typography>}
    </Box>
  );
}
