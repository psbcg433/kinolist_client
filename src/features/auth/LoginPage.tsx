import { useState } from 'react';
import {
  Button,
  CircularProgress,
  TextField,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../api/authApi';
import { useAppDispatch } from '../../store/hooks';
import { pushToast } from '../../store/uiSlice';
import { usePageMeta } from '../../hooks/usePageMeta';
import { readErrorDetails } from '../../api/baseQuery';
import { AuthLayout } from './AuthLayout';

export default function LoginPage() {
  usePageMeta('Login');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormErrors({});
    try {
      const res = await login({ email, password });
      if ('data' in res && res.data) {
        if ('accessToken' in res.data) {
          dispatch(pushToast({ message: 'Welcome back', severity: 'success' }));
          navigate('/', { replace: true });
        } else if ('requiresTwoFactor' in res.data) {
          navigate('/verify-2fa', { replace: true });
        }
        return;
      }
      // error
      const details = readErrorDetails(res.error as never);
      const msg = (res.error as { data?: { error?: { message?: string } } })?.data?.error?.message;
      const detailsArr = Array.isArray(details) ? (details as { field?: string; message?: string }[]) : [];
      const mapped: Record<string, string> = {};
      for (const d of detailsArr) {
        if (d.field) mapped[d.field] = d.message ?? 'Invalid value';
      }
      if (Object.keys(mapped).length) setFormErrors(mapped);
      else setFormError(msg ?? 'Login failed. Please try again.');
    } catch {
      setFormError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to KinoList"
      subtitle="Pick up your watchlist and recommendations right where you left them."
      footer={<>No account?{' '}<MuiLink component={Link} to="/register">Create one</MuiLink></>}
    >
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!formErrors.email}
          helperText={formErrors.email}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!formErrors.password}
          helperText={formErrors.password}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
        </Button>
      </form>

    </AuthLayout>
  );
}
