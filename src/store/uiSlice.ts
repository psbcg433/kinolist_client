import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: number;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export interface UiState {
  toasts: Toast[];
  globalLoading: boolean;
}

const initialState: UiState = {
  toasts: [],
  globalLoading: false,
};

let toastId = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    pushToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      state.toasts.push({ id: ++toastId, ...action.payload });
      if (state.toasts.length > 4) state.toasts.shift();
    },
    dismissToast(state, action: PayloadAction<number>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
  },
});

export const { pushToast, dismissToast, setGlobalLoading } = uiSlice.actions;

export default uiSlice.reducer;
