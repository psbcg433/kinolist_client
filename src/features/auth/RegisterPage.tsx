import { useState } from 'react';
import {
  Button,
  CircularProgress,
  TextField,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../api/authApi';
import { useAppDispatch } from '../../store/hooks';
import { pushToast } from '../../store/uiSlice';
import { usePageMeta } from '../../hooks/usePageMeta';
import { readErrorDetails } from '../../api/baseQuery';
import { AuthLayout } from './AuthLayout';

export default function RegisterPage() {
  usePageMeta('Register');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormErrors({});
    try {
      const res = await register({ email, password, name: name || undefined });
      if ('data' in res && res.data) {
        dispatch(pushToast({ message: 'Account created — please sign in', severity: 'success' }));
        navigate('/login', { replace: true });
        return;
      }
      const details = readErrorDetails(res.error as never);
      const msg = (res.error as { data?: { error?: { message?: string } } })?.data?.error?.message;
      const detailsArr = Array.isArray(details) ? (details as { field?: string; message?: string }[]) : [];
      const mapped: Record<string, string> = {};
      for (const d of detailsArr) {
        if (d.field) mapped[d.field] = d.message ?? 'Invalid value';
      }
      if (Object.keys(mapped).length) setFormErrors(mapped);
      else setFormError(msg ?? 'Registration failed. Please try again.');
    } catch {
      setFormError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthLayout
      eyebrow="Join KinoList"
      title="Create your account"
      subtitle="One account, your own library, and recommendations shaped around you."
      footer={<>Already have an account?{' '}<MuiLink component={Link} to="/login">Sign in</MuiLink></>}
    >
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Name (optional)"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!formErrors.password}
          helperText={formErrors.password || '8–72 characters, at least one letter and one number'}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
        </Button>
      </form>

    </AuthLayout>
  );
}
