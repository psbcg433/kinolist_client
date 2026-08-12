import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { router } from './router';
import { theme } from './styles/theme';
import { SnackbarHost } from './components/ui/SnackbarHost';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
        <SnackbarHost />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
