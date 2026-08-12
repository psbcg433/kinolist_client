import { useMemo, useState } from 'react';
import {
  Button,
  CircularProgress,
  TextField,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useVerify2faLoginMutation } from '../../api/authApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearChallenge } from '../../store/authSlice';
import { pushToast } from '../../store/uiSlice';
import { useCountdown } from '../../hooks/useCountdown';
import { usePageMeta } from '../../hooks/usePageMeta';
import { AuthLayout } from './AuthLayout';

export default function TwoFactorPage() {
  usePageMeta('Verify 2FA');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const challenge = useAppSelector((s) => s.auth.twoFactorChallenge);
  const [verify, { isLoading }] = useVerify2faLoginMutation();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const expiresAt = useMemo(
    () => (challenge ? Date.now() + challenge.expiresInSeconds * 1000 : 0),
    [challenge]
  );
  const countdown = useCountdown(expiresAt);

  if (!challenge) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await verify({ challengeId: challenge.challengeId, code });
      if ('data' in res && res.data) {
        dispatch(clearChallenge());
        dispatch(pushToast({ message: 'Signed in', severity: 'success' }));
        navigate('/', { replace: true });
        return;
      }
      const msg = (res.error as { data?: { error?: { message?: string } } })?.data?.error?.message;
      setError(msg ?? 'Verification failed. Check the code and try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthLayout
      eyebrow="Protected sign-in"
      title="Check your inbox"
      subtitle={<>We emailed a six-digit code to <strong>{challenge.delivery.destination}</strong>. It expires in {countdown}s.</>}
      footer={countdown === 0 ? <>Code expired.{' '}<MuiLink component={Link} to="/login">Sign in again for a new code</MuiLink></> : undefined}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="6-digit code"
          fullWidth
          required
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || code.length !== 6 || countdown === 0}
        >
          {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Verify & sign in'}
        </Button>
      </form>

    </AuthLayout>
  );
}
