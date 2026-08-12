import { Alert, Snackbar } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { dismissToast } from '../../store/uiSlice';

export function SnackbarHost() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  const dispatch = useAppDispatch();
  const last = toasts[0];

  return (
    <Snackbar
      key={last?.id}
      open={!!last}
      autoHideDuration={4000}
      onClose={() => last && dispatch(dismissToast(last.id))}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {last ? (
        <Alert
          severity={last.severity}
          variant="filled"
          onClose={() => dispatch(dismissToast(last.id))}
        >
          {last.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
