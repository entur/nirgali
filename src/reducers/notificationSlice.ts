import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export type NotificationState = Notification | null;

export const notificationSlice = createSlice({
  name: 'notification',
  initialState: null as NotificationState,
  reducers: {
    showNotification: (_state, action: PayloadAction<Notification>) =>
      action.payload,
    clearNotification: () => null,
  },
});

export const { showNotification, clearNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
