import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TheatersRoundedIcon from '@mui/icons-material/TheatersRounded';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useSessionBootstrap } from '../../hooks/useAuth';
import { useAppDispatch } from '../../store/hooks';
import { logoutLocal } from '../../store/authSlice';
import { authApi, useLogoutMutation } from '../../api/authApi';
import { useGetSummaryQuery } from '../../api/libraryApi';
import { pushToast } from '../../store/uiSlice';

const PUBLIC_NAV = [
  { to: '/', label: 'Browse' },
  { to: '/search', label: 'Search' },
];

const MEMBER_NAV = [{ to: '/recommendations', label: 'For You' }];

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
  const navItems = isAuthenticated ? [...PUBLIC_NAV, ...MEMBER_NAV] : PUBLIC_NAV;

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
    } catch {
      // The browser session still has to be cleared if the network is unavailable.
    }
    dispatch(logoutLocal());
    dispatch(authApi.util.resetApiState());
    dispatch(pushToast({ message: 'Logged out', severity: 'info' }));
    navigate('/login');
  };

  const closeMenus = () => {
    setAccountAnchor(null);
    setMobileAnchor(null);
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, gap: 1 }}>
          <Box
            component={Link}
            to="/"
            aria-label="KinoList home"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              mr: { xs: 1, md: 4 },
              flexShrink: 0,
              color: 'text.primary',
              textDecoration: 'none',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                width: 34,
                height: 34,
                placeItems: 'center',
                borderRadius: 2,
                color: 'common.white',
                background: 'linear-gradient(135deg, #e50914, #ff5364)',
                boxShadow: '0 8px 24px rgba(229,9,20,.28)',
              }}
            >
              <TheatersRoundedIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
              Kino<span style={{ color: '#ff4650' }}>List</span>
            </Typography>
          </Box>

          {!isMobile && (
            <Box component="nav" aria-label="Main navigation" sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  color="inherit"
                  size="small"
                  sx={{
                    minHeight: 36,
                    px: 1.5,
                    color: isActive(item.to) ? 'text.primary' : 'text.secondary',
                    bgcolor: isActive(item.to) ? 'action.selected' : 'transparent',
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />
          <Tooltip title="Search movies">
            <IconButton component={Link} to="/search" color="inherit" aria-label="Search movies">
              <SearchRoundedIcon />
            </IconButton>
          </Tooltip>

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="Open navigation"
                onClick={(event) => setMobileAnchor(event.currentTarget)}
              >
                <MenuRoundedIcon />
              </IconButton>
              <Menu anchorEl={mobileAnchor} open={Boolean(mobileAnchor)} onClose={closeMenus}>
                {navItems.map((item) => (
                  <MenuItem key={item.to} component={Link} to={item.to} onClick={closeMenus} selected={isActive(item.to)}>
                    {item.label}
                  </MenuItem>
                ))}
                {isAuthenticated ? (
                  <>
                    <MenuItem component={Link} to="/library" onClick={closeMenus}>My library</MenuItem>
                    <MenuItem component={Link} to="/profile" onClick={closeMenus}>Profile</MenuItem>
                    <MenuItem component={Link} to="/settings" onClick={closeMenus}>Settings</MenuItem>
                    <MenuItem onClick={handleLogout} disabled={isLoading}>Log out</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem component={Link} to="/login" onClick={closeMenus}>Sign in</MenuItem>
                    <MenuItem component={Link} to="/register" onClick={closeMenus}>Create account</MenuItem>
                  </>
                )}
              </Menu>
            </>
          ) : isAuthenticated ? (
            <>
              <Tooltip title="My library">
                <IconButton component={Link} to="/library" color="inherit" aria-label="My library">
                  <Badge badgeContent={watchlistCount} color="secondary" max={99}>
                    <BookmarkBorderRoundedIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <IconButton
                aria-label="Open account menu"
                onClick={(event) => setAccountAnchor(event.currentTarget)}
                sx={{ ml: 0.5 }}
              >
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14, fontWeight: 800 }}>
                  {user?.email?.charAt(0).toUpperCase() ?? '?'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={closeMenus}>
                <MenuItem component={Link} to="/profile" onClick={closeMenus}>Profile</MenuItem>
                <MenuItem component={Link} to="/settings" onClick={closeMenus}>Settings</MenuItem>
                <MenuItem component={Link} to="/settings/security" onClick={closeMenus}>Security</MenuItem>
                <MenuItem onClick={handleLogout} disabled={isLoading}>Log out</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" color="inherit" size="small">Sign in</Button>
              <Button component={Link} to="/register" variant="contained" size="small" sx={{ ml: 0.5 }}>
                Join free
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ mt: 6, py: 4, px: 2, textAlign: 'center', color: 'text.secondary', borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption">KinoList · discover, organise, and remember what to watch next.</Typography>
      </Box>
    </Box>
  );
}
