import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  useSetup2faMutation,
  useSetup2faVerifyMutation,
  useReset2faMutation,
  useLogoutAllMutation,
} from '../../api/authApi';
import { useMeQuery } from '../../api/authApi';
import { useAppDispatch } from '../../store/hooks';
import { pushToast } from '../../store/uiSlice';
import { logoutLocal } from '../../store/authSlice';
import { authApi } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import { useCountdown } from '../../hooks/useCountdown';
import { usePageMeta } from '../../hooks/usePageMeta';
import { LoadingState } from '../../components/state';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export default function SecurityPage() {
  usePageMeta('Security');
  const { data, isLoading, refetch } = useMeQuery();
  const [setup2fa] = useSetup2faMutation();
  const [setup2faVerify] = useSetup2faVerifyMutation();
  const [reset2fa] = useReset2faMutation();
  const [logoutAll] = useLogoutAllMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const twoFAEnabled = !!data?.user?.twoFAEnabled;

  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<{ challengeId: string; expiresInSeconds: number; destination: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);

  const expiresAt = challenge ? Date.now() + challenge.expiresInSeconds * 1000 : 0;
  const countdown = useCountdown(expiresAt);

  if (isLoading || !data?.user) return <LoadingState />;

  const startSetup = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await setup2fa({ password });
      if ('data' in res && res.data) {
        setChallenge({ challengeId: res.data.challengeId, expiresInSeconds: res.data.expiresInSeconds, destination: res.data.delivery.destination });
        setCode('');
      } else {
        setError((res.error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'Could not start 2FA setup.');
      }
    } finally {
      setBusy(false);
    }
  };

  const verifySetup = async () => {
    if (!challenge) return;
    setError(null);
    setBusy(true);
    try {
      const res = await setup2faVerify({ challengeId: challenge.challengeId, code });
      if ('data' in res && res.data) {
        setChallenge(null);
        setPassword('');
        setCode('');
        refetch();
        dispatch(pushToast({ message: 'Two-factor authentication enabled', severity: 'success' }));
      } else {
        setError((res.error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'Invalid code.');
      }
    } finally {
      setBusy(false);
    }
  };

  const resetTwoFA = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await reset2fa({ password });
      if ('data' in res && res.data) {
        setPassword('');
        refetch();
        dispatch(pushToast({ message: 'Two-factor authentication disabled', severity: 'info' }));
      } else {
        setError((res.error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'Could not reset 2FA.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllOpen(false);
    try {
      await logoutAll(undefined).unwrap();
    } catch {
      // proceed with local logout regardless
    }
    dispatch(logoutLocal());
    dispatch(authApi.util.resetApiState());
    dispatch(pushToast({ message: 'Logged out everywhere', severity: 'info' }));
    navigate('/login');
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Security
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Two-factor authentication</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {twoFAEnabled
              ? 'Enabled. Codes are delivered to your email inbox.'
              : 'Disabled. Add an extra step to sign-in — a code is emailed to you.'}
          </Typography>

          {!twoFAEnabled && !challenge && (
            <>
              <TextField
                label="Current password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={startSetup} disabled={busy || !password}>
                Enable 2FA
              </Button>
            </>
          )}

          {challenge && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                A code was emailed to {challenge.destination}. Enter it below
                (expires in {countdown}s).
              </Alert>
              <TextField
                label="6-digit code"
                fullWidth
                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={verifySetup} disabled={busy || code.length !== 6 || countdown === 0}>
                Verify & enable
              </Button>
            </>
          )}

          {twoFAEnabled && (
            <>
              <TextField
                label="Current password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" onClick={resetTwoFA} disabled={busy || !password}>
                Disable 2FA
              </Button>
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Sessions</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Log out of every device, including this one. You'll need to sign in again.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button component="a" href="/settings/sessions" variant="outlined">
              View sessions
            </Button>
            <Button color="error" variant="outlined" onClick={() => setLogoutAllOpen(true)}>
              Log out everywhere
            </Button>
          </Box>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={logoutAllOpen}
        title="Log out everywhere?"
        message="All sessions will be revoked, including this device. You will need to sign in again."
        confirmLabel="Log out everywhere"
        destructive
        onConfirm={handleLogoutAll}
        onClose={() => setLogoutAllOpen(false)}
      />
    </Box>
  );
}
