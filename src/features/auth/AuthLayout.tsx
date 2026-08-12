import { Box, Paper, Stack, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <Paper sx={{ maxWidth: 980, mx: 'auto', my: { xs: 1, md: 4 }, overflow: 'hidden', borderRadius: 4 }}>
      <Grid2 container>
        <Grid2
          size={{ xs: 12, md: 5 }}
          sx={{
            display: { xs: 'none', md: 'flex' },
            minHeight: 610,
            p: 5,
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'radial-gradient(circle at 70% 20%, rgba(229,9,20,.38), transparent 34%), radial-gradient(circle at 20% 80%, rgba(91,124,250,.42), transparent 42%), #0d1320',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeRoundedIcon color="primary" />
            <Typography fontWeight={800}>A library that learns your taste</Typography>
          </Stack>
          <Box>
            <Typography variant="h3" sx={{ mb: 2 }}>Keep every great watch within reach.</Typography>
            <Typography color="text.secondary">
              Discover new titles, organise favourites and watchlists, and return to a personalised home on every device.
            </Typography>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 7 }} sx={{ p: { xs: 3, sm: 5, md: 6 }, minHeight: { md: 610 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="overline" color="primary.light" sx={{ letterSpacing: '.16em', fontWeight: 800 }}>
            {eyebrow}
          </Typography>
          <Typography variant="h4" component="h1" sx={{ mt: 0.5, mb: 1 }}>{title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>{subtitle}</Typography>
          {children}
          {footer && <Box sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>{footer}</Box>}
        </Grid2>
      </Grid2>
    </Paper>
  );
}
