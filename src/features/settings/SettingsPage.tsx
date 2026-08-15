import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import {
  authApi,
  useDeleteAccountMutation,
  useListSessionsQuery,
  useLogoutAllMutation,
  useMeQuery as useGetAuthMeQuery,
  useReset2faMutation,
  useRevokeSessionMutation,
  useSetup2faMutation,
  useSetup2faVerifyMutation,
} from '../../api/authApi';
import { useGetMeQuery as useGetProfileMeQuery, useUpdateMutation } from '../../api/profileApi';
import type { ProfileUser, SessionInfo } from '../../api/types';
import { LoadingState } from '../../components/state';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useCountdown } from '../../hooks/useCountdown';
import { usePageMeta } from '../../hooks/usePageMeta';
import { IMAGE_MAX_BYTES, IMAGE_MIME_TYPES } from '../../lib/constants';
import { logoutLocal } from '../../store/authSlice';
import { useAppDispatch } from '../../store/hooks';
import { pushToast } from '../../store/uiSlice';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  usePageMeta('Settings');
  const profile = useGetProfileMeQuery();
  const auth = useGetAuthMeQuery();
  const sessions = useListSessionsQuery();

  useEffect(() => {
    if (!window.location.hash) return;
    const timer = window.setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => window.clearTimeout(timer);
  }, []);

  if (profile.isLoading || auth.isLoading || !profile.data?.user || !auth.data?.user) return <LoadingState />;

  return (
    <Box sx={{ maxWidth: 980, mx: 'auto' }}>
      <Typography variant="overline" color="primary.light" fontWeight={900} letterSpacing=".14em">ACCOUNT CENTRE</Typography>
      <Typography variant="h3" component="h1" sx={{ mt: .5 }}>Settings</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>Profile, privacy, sign-in security, active devices, and account controls in one place.</Typography>

      <Stack spacing={2.5}>
        <ProfileSettings user={profile.data.user} />
        <TwoFactorSettings enabled={auth.data.user.twoFAEnabled} onChanged={() => auth.refetch()} />
        <SessionSettings sessions={sessions.data?.sessions ?? []} loading={sessions.isLoading} />
        <DangerSettings />
      </Stack>
    </Box>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'grid', width: 44, height: 44, placeItems: 'center', color: 'primary.light', bgcolor: 'rgba(146,84,255,.13)', border: 1, borderColor: 'rgba(146,84,255,.28)', borderRadius: 2 }}>{icon}</Box>
      <Box><Typography variant="h6" component="h2">{title}</Typography><Typography variant="body2" color="text.secondary">{subtitle}</Typography></Box>
    </Stack>
  );
}

function ProfileSettings({ user }: { user: ProfileUser }) {
  const [update, { isLoading }] = useUpdateMutation();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [coverPic, setCoverPic] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const profilePreview = useObjectUrl(profilePic);
  const coverPreview = useObjectUrl(coverPic);

  const reset = () => { setName(user.name); setBio(user.bio); setProfilePic(null); setCoverPic(null); setErrors({}); };
  const validate = (file: File | null) => {
    if (!file) return null;
    if (!IMAGE_MIME_TYPES.includes(file.type)) return 'Use JPEG, PNG, GIF, or WEBP.';
    if (file.size > IMAGE_MAX_BYTES) return 'Image must be 5 MB or smaller.';
    return null;
  };
  const save = async () => {
    const nextErrors: Record<string, string> = {};
    const avatarError = validate(profilePic);
    const coverError = validate(coverPic);
    if (avatarError) nextErrors.profilePic = avatarError;
    if (coverError) nextErrors.coverPic = coverError;
    if (!name.trim()) nextErrors.name = 'Display name is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const result = await update({ name: name.trim(), bio: bio.trim(), profilePic: profilePic ?? undefined, coverPic: coverPic ?? undefined });
    if ('error' in result) {
      dispatch(pushToast({ message: (result.error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'Could not update profile', severity: 'error' }));
      return;
    }
    setProfilePic(null); setCoverPic(null);
    dispatch(pushToast({ message: 'Profile updated', severity: 'success' }));
  };

  return (
    <Card id="profile"><CardContent sx={{ p: { xs: 2.5, md: 3.5 }, '&:last-child': { pb: { xs: 2.5, md: 3.5 } } }}>
      <SectionTitle icon={<PersonRoundedIcon />} title="Public profile" subtitle="Control how your KinoList profile appears." />
      <Box sx={{ position: 'relative', height: { xs: 150, md: 210 }, mb: 7, borderRadius: 2.5, overflow: 'visible', bgcolor: '#191724', backgroundImage: (coverPreview || user.coverPic) ? `linear-gradient(0deg, rgba(7,7,17,.54), transparent), url("${coverPreview || user.coverPic}")` : 'linear-gradient(135deg, #241445, #151324)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Button component="label" size="small" variant="contained" startIcon={<ImageRoundedIcon />} sx={{ position: 'absolute', right: 14, bottom: 14 }}>Change cover<input hidden type="file" accept={IMAGE_MIME_TYPES.join(',')} onChange={(event) => setCoverPic(event.target.files?.[0] ?? null)} /></Button>
        <Box sx={{ position: 'absolute', left: { xs: 18, md: 28 }, bottom: -50 }}>
          <Avatar src={profilePreview || user.profilePic || undefined} alt={`${name} profile picture`} sx={{ width: 104, height: 104, border: '5px solid', borderColor: 'background.paper', bgcolor: 'primary.dark', fontSize: 34 }}>{name.charAt(0).toUpperCase()}</Avatar>
          <Button component="label" aria-label="Change profile picture" sx={{ position: 'absolute', inset: 'auto -12px -4px auto', minWidth: 38, width: 38, height: 38, p: 0, borderRadius: '50%' }} variant="contained"><ImageRoundedIcon fontSize="small" /><input hidden type="file" accept={IMAGE_MIME_TYPES.join(',')} onChange={(event) => setProfilePic(event.target.files?.[0] ?? null)} /></Button>
        </Box>
      </Box>
      {(errors.profilePic || errors.coverPic) && <Alert severity="error" sx={{ mb: 2 }}>{errors.profilePic || errors.coverPic}</Alert>}
      <Stack spacing={2}>
        <TextField label="Display name" value={name} onChange={(event) => setName(event.target.value)} error={!!errors.name} helperText={errors.name} inputProps={{ maxLength: 80 }} fullWidth />
        <TextField label="Bio" value={bio} onChange={(event) => setBio(event.target.value)} multiline minRows={3} inputProps={{ maxLength: 300 }} helperText={`${bio.length}/300`} fullWidth />
        <Stack direction="row" justifyContent="flex-end" spacing={1}><Button onClick={reset} disabled={isLoading}>Restore saved values</Button><Button variant="contained" onClick={save} disabled={isLoading}>{isLoading ? 'Saving…' : 'Save profile'}</Button></Stack>
      </Stack>
    </CardContent></Card>
  );
}

function TwoFactorSettings({ enabled, onChanged }: { enabled: boolean; onChanged: () => void }) {
  const [setup] = useSetup2faMutation();
  const [verify] = useSetup2faVerifyMutation();
  const [reset2fa] = useReset2faMutation();
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<{ id: string; destination: string; expiresAt: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const countdown = useCountdown(challenge?.expiresAt ?? 0);

  const begin = async () => {
    setBusy(true); setError(null);
    const result = await setup({ password });
    setBusy(false);
    if ('error' in result) return setError((result.error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'Could not start 2FA setup.');
    if (result.data) setChallenge({ id: result.data.challengeId, destination: result.data.delivery.destination, expiresAt: Date.now() + result.data.expiresInSeconds * 1000 });
  };
  const confirm = async () => {
    if (!challenge) return;
    setBusy(true); setError(null);
    const result = await verify({ challengeId: challenge.id, code });
    setBusy(false);
    if ('error' in result) return setError((result.error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'The code is invalid.');
    setChallenge(null); setPassword(''); setCode(''); onChanged();
    dispatch(pushToast({ message: 'Two-factor authentication enabled', severity: 'success' }));
  };
  const disable = async () => {
    setBusy(true); setError(null);
    const result = await reset2fa({ password });
    setBusy(false);
    if ('error' in result) return setError((result.error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'Could not disable 2FA.');
    setPassword(''); onChanged();
    dispatch(pushToast({ message: 'Two-factor authentication disabled', severity: 'info' }));
  };

  return (
    <Card id="security"><CardContent sx={{ p: { xs: 2.5, md: 3.5 }, '&:last-child': { pb: { xs: 2.5, md: 3.5 } } }}>
      <SectionTitle icon={<SecurityRoundedIcon />} title="Two-factor authentication" subtitle="Email-delivered, short-lived sign-in verification." />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}><Chip color={enabled ? 'success' : 'default'} label={enabled ? 'Enabled' : 'Disabled'} /><Typography variant="body2" color="text.secondary">{enabled ? 'Every new login requires the emailed code.' : 'Password-only login is currently active.'}</Typography></Stack>
      {challenge ? (
        <Stack spacing={2}>
          <Alert severity="info">A six-digit code was sent to {challenge.destination}. It expires in {countdown}s.</Alert>
          <TextField label="Six-digit code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputProps={{ inputMode: 'numeric', maxLength: 6 }} />
          <Box><Button variant="contained" onClick={confirm} disabled={busy || code.length !== 6 || countdown === 0}>Verify and enable</Button></Box>
        </Stack>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }}>
          <TextField label="Current password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} sx={{ flex: 1 }} />
          <Button variant={enabled ? 'outlined' : 'contained'} color={enabled ? 'error' : 'primary'} onClick={enabled ? disable : begin} disabled={busy || !password} sx={{ minHeight: 56 }}>{enabled ? 'Disable 2FA' : 'Enable 2FA'}</Button>
        </Stack>
      )}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>{error}</Alert>}
    </CardContent></Card>
  );
}

function SessionSettings({ sessions, loading }: { sessions: SessionInfo[]; loading: boolean }) {
  const [revoke] = useRevokeSessionMutation();
  const [logoutAll] = useLogoutAllMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const revokeOne = async (id: string) => {
    const result = await revoke(id);
    dispatch(pushToast({ message: 'error' in result ? 'Could not revoke session' : 'Session revoked', severity: 'error' in result ? 'error' : 'info' }));
  };
  const logoutEverywhere = async () => {
    setLogoutOpen(false);
    try { await logoutAll(undefined).unwrap(); } catch { /* clear local session regardless */ }
    dispatch(logoutLocal()); dispatch(authApi.util.resetApiState()); navigate('/login');
  };
  return (
    <Card id="sessions"><CardContent sx={{ p: { xs: 2.5, md: 3.5 }, '&:last-child': { pb: { xs: 2.5, md: 3.5 } } }}>
      <SectionTitle icon={<DevicesRoundedIcon />} title="Signed-in devices" subtitle="Review and revoke every active KinoList session." />
      {loading ? <LoadingState /> : sessions.length === 0 ? <Typography color="text.secondary">No active sessions.</Typography> : (
        <Stack divider={<Divider flexItem />}>
          {sessions.map((session) => <SessionRow key={session.id} session={session} onRevoke={() => revokeOne(session.id)} />)}
        </Stack>
      )}
      <Box sx={{ mt: 2.5 }}><Button color="error" variant="outlined" startIcon={<LogoutRoundedIcon />} onClick={() => setLogoutOpen(true)}>Log out everywhere</Button></Box>
      <ConfirmDialog open={logoutOpen} title="Log out everywhere?" message="Every session will be revoked, including this device." confirmLabel="Log out everywhere" destructive onConfirm={logoutEverywhere} onClose={() => setLogoutOpen(false)} />
    </CardContent></Card>
  );
}

function SessionRow({ session, onRevoke }: { session: SessionInfo; onRevoke: () => void }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ py: 1.7 }}>
      <Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 2, bgcolor: 'rgba(255,255,255,.05)' }}><DevicesRoundedIcon fontSize="small" /></Box><Box><Stack direction="row" spacing={1} alignItems="center"><Typography variant="body2" fontWeight={800}>{session.device || 'Unknown device'}</Typography>{session.current && <Chip label="This device" size="small" color="primary" />}</Stack><Typography variant="caption" color="text.secondary">{session.ip || 'Unknown IP'} · Last active {new Date(session.lastSeenAt).toLocaleString()}</Typography></Box></Stack>
      {!session.current && <Button size="small" color="error" onClick={onRevoke}>Revoke</Button>}
    </Stack>
  );
}

function DangerSettings() {
  const [deleteAccount] = useDeleteAccountMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true); setError(null);
    const result = await deleteAccount({ password });
    setBusy(false);
    if ('error' in result) return setError((result.error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'Could not delete account.');
    dispatch(logoutLocal()); dispatch(authApi.util.resetApiState()); navigate('/login', { replace: true });
  };
  return (
    <Card sx={{ borderColor: 'rgba(255,72,92,.42)' }}><CardContent sx={{ p: { xs: 2.5, md: 3.5 }, '&:last-child': { pb: { xs: 2.5, md: 3.5 } } }}>
      <SectionTitle icon={<LockRoundedIcon />} title="Danger zone" subtitle="Permanent account and data controls." />
      <Alert severity="warning" sx={{ mb: 2 }}>Deleting your account permanently removes your profile and library. There is no restore after deletion.</Alert>
      <Button color="error" variant="outlined" startIcon={<DeleteForeverRoundedIcon />} onClick={() => setOpen(true)}>Delete account</Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth><DialogTitle>Delete your account?</DialogTitle><DialogContent><DialogContentText sx={{ mb: 2 }}>This cannot be undone. Enter your password to confirm.</DialogContentText>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<TextField fullWidth label="Current password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button color="error" variant="contained" disabled={busy || !password} onClick={remove}>{busy ? 'Deleting…' : 'Delete permanently'}</Button></DialogActions></Dialog>
    </CardContent></Card>
  );
}

function useObjectUrl(file: File | null) {
  const url = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}
