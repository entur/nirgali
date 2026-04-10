import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  key: string;
  title: string;
  message: string;
  type: NotificationType;
  duration: number;
}

export type NotificationState = Notification | null;

interface ShowNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  success: 5000,
  error: 10000,
  warning: 5000,
  info: 5000,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState: null as NotificationState,
  reducers: {
    showNotification: {
      reducer: (_state, action: PayloadAction<Notification>) => action.payload,
      prepare: (payload: ShowNotificationPayload) => ({
        payload: {
          key: crypto.randomUUID(),
          title: payload.title,
          message: payload.message,
          type: payload.type,
          duration: payload.duration ?? DEFAULT_DURATIONS[payload.type],
        },
      }),
    },
    clearNotification: () => null,
  },
});

export const { showNotification, clearNotification } =
  notificationSlice.actions;

export const showSuccessNotification = (title: string, message: string) =>
  showNotification({ title, message, type: 'success' });

export const showErrorNotification = (title: string, message: string) =>
  showNotification({ title, message, type: 'error' });

export default notificationSlice.reducer;
