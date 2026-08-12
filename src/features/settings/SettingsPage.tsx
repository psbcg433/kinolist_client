import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useGetMeQuery } from '../../api/profileApi';
import { useDeleteAccountMutation } from '../../api/authApi';
import { useAppDispatch } from '../../store/hooks';
import { logoutLocal } from '../../store/authSlice';
import { authApi } from '../../api/authApi';
import { pushToast } from '../../store/uiSlice';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import { LoadingState } from '../../components/state';
import { useAuth } from '../../hooks/useAuth';

export default function SettingsPage() {
  usePageMeta('Settings');
  const { data, isLoading } = useGetMeQuery();
  const { user: authUser } = useAuth();
  const [deleteAccount] = useDeleteAccountMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (isLoading || !data?.user) return <LoadingState />;
  const { user } = data;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteAccount({ password });
      if ('data' in res && res.data) {
        dispatch(logoutLocal());
        dispatch(authApi.util.resetApiState());
        dispatch(pushToast({ message: 'Account deleted', severity: 'info' }));
        navigate('/login', { replace: true });
        return;
      }
      const msg = (res.error as { data?: { error?: { message?: string } } })?.data?.error?.message;
      setError(msg ?? 'Could not delete account. Check your password.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Settings
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Profile</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {user.name || 'No name set'} · {authUser?.email ?? 'Email unavailable'}
          </Typography>
          <Button component={Link} to="/profile" variant="outlined" size="small">
            Edit profile
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Security</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Two-factor authentication, sessions, and logout everywhere.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button component={Link} to="/settings/security" variant="outlined" size="small">
              Manage 2FA & sessions
            </Button>
            <Button component={Link} to="/settings/sessions" variant="outlined" size="small">
              View sessions
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderColor: 'error.main', border: 1 }}>
        <CardContent>
          <Typography variant="h6" color="error" sx={{ mb: 1 }}>
            Danger zone
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Deleting your account removes your profile, library, and search history
            permanently. This cannot be undone.
          </Typography>
          <Button color="error" variant="outlined" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This is permanent and irreversible. Enter your password to confirm.
          </DialogContentText>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting || !password}
            onClick={handleDelete}
          >
            {deleting ? 'Deleting…' : 'Delete account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
