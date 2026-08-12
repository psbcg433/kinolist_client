import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useListSessionsQuery, useRevokeSessionMutation } from '../../api/authApi';
import { usePageMeta } from '../../hooks/usePageMeta';
import { LoadingState } from '../../components/state';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAppDispatch } from '../../store/hooks';
import { pushToast } from '../../store/uiSlice';

export default function SessionsPage() {
  usePageMeta('Sessions');
  const { data, isLoading } = useListSessionsQuery();
  const [revoke] = useRevokeSessionMutation();
  const dispatch = useAppDispatch();
  const sessions = data?.sessions ?? [];

  const handleRevoke = async (id: string) => {
    const res = await revoke(id);
    if ('error' in res) {
      dispatch(pushToast({ message: 'Could not revoke session', severity: 'error' }));
    } else {
      dispatch(pushToast({ message: 'Session revoked', severity: 'info' }));
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <Box>
      <PageHeader title="Sessions" subtitle="Every device currently signed in to your account" />

      <Card>
        <CardContent>
          {sessions.length === 0 ? (
            <Typography color="text.secondary">No active sessions.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Device</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Last seen</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {s.device || 'Unknown device'}
                        {s.current && (
                          <Chip size="small" label="current" color="primary" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>{s.ip || '—'}</TableCell>
                      <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(s.lastSeenAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          color="error"
                          disabled={s.current}
                          onClick={() => handleRevoke(s.id)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
