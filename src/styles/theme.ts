import { alpha, createTheme } from '@mui/material/styles';

const navy = '#080b12';
const surface = '#111722';
const blue = '#5b7cfa';
const red = '#e50914';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: blue, light: '#8da4ff', dark: '#3658d4', contrastText: '#fff' },
    secondary: { main: red, light: '#ff4650', dark: '#ad0710', contrastText: '#fff' },
    background: { default: navy, paper: surface },
    text: { primary: '#f6f8fc', secondary: '#9ba8bc' },
    divider: alpha('#a9b8d0', 0.16),
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
        body: { backgroundImage: 'radial-gradient(circle at 15% -10%, rgba(91,124,250,.13), transparent 32%)' },
        '::selection': { background: alpha(blue, 0.42) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 999, minHeight: 40, paddingInline: 20 },
        containedPrimary: { backgroundImage: `linear-gradient(135deg, ${blue}, #745cf6)` },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { backgroundColor: surface, backgroundImage: 'none', border: `1px solid ${alpha('#a9b8d0', 0.12)}` },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(navy, 0.84),
          backgroundImage: 'none',
          backdropFilter: 'blur(18px)',
          borderBottom: `1px solid ${alpha('#a9b8d0', 0.13)}`,
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { backgroundColor: '#111722', border: `1px solid ${alpha('#a9b8d0', 0.16)}` } } },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: alpha('#0b1019', 0.72), '& fieldset': { borderColor: alpha('#a9b8d0', 0.22) } },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 650 } } },
    MuiSkeleton: { defaultProps: { animation: 'wave' }, styleOverrides: { root: { backgroundColor: alpha('#9fb1cd', 0.1) } } },
  },
});
