import { alpha, createTheme } from '@mui/material/styles';

const ink = '#070711';
const surface = '#100e1d';
const violet = '#9254ff';
const magenta = '#ec3dff';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: violet, light: '#c39aff', dark: '#6730cb', contrastText: '#fff' },
    secondary: { main: magenta, light: '#f887ff', dark: '#a91db7', contrastText: '#fff' },
    background: { default: ink, paper: surface },
    text: { primary: '#f7f3ff', secondary: '#aaa2ba' },
    divider: alpha('#c5a9ff', 0.14),
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 850, letterSpacing: '-0.045em' },
    h2: { fontWeight: 850, letterSpacing: '-0.04em' },
    h3: { fontWeight: 820, letterSpacing: '-0.035em' },
    h4: { fontWeight: 800, letterSpacing: '-0.025em' },
    h5: { fontWeight: 760, letterSpacing: '-0.018em' },
    button: { fontWeight: 750, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'radial-gradient(circle at 18% -10%, rgba(146,84,255,.17), transparent 30%), radial-gradient(circle at 88% 18%, rgba(236,61,255,.07), transparent 24%)',
        },
        '::selection': { background: alpha(violet, 0.48) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 999, minHeight: 40, paddingInline: 20 },
        containedPrimary: {
          backgroundImage: 'linear-gradient(135deg, #7136ff, #a91db7)',
          '&:hover': { boxShadow: `0 10px 28px ${alpha(violet, 0.32)}` },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundColor: surface, backgroundImage: 'none', border: `1px solid ${alpha('#c5a9ff', 0.12)}` },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(ink, 0.86),
          backgroundImage: 'none',
          backdropFilter: 'blur(18px)',
          borderBottom: `1px solid ${alpha('#c5a9ff', 0.13)}`,
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { backgroundColor: '#100e1d', border: `1px solid ${alpha('#c5a9ff', 0.18)}` } } },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: alpha('#090812', 0.78), '& fieldset': { borderColor: alpha('#c5a9ff', 0.2) } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 650 },
        colorPrimary: { color: '#fff', backgroundColor: '#6730cb' },
      },
    },
    MuiSkeleton: { defaultProps: { animation: 'wave' }, styleOverrides: { root: { backgroundColor: alpha('#c5a9ff', 0.1) } } },
  },
});
