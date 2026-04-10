import {
  configureStore,
  combineReducers,
  ThunkAction,
  UnknownAction,
} from '@reduxjs/toolkit';
import notificationReducer from '../reducers/notificationSlice';
import organizationsReducer from '../reducers/organizationsSlice';
import messagesReducer from '../reducers/messagesSlice';
import cancellationsReducer from '../reducers/cancellationsSlice';
import extrajourneysReducer from '../reducers/extrajourneysSlice';
import linesReducer from '../reducers/linesSlice';

const rootReducer = combineReducers({
  notification: notificationReducer,
  organizations: organizationsReducer,
  messages: messagesReducer,
  cancellations: cancellationsReducer,
  extrajourneys: extrajourneysReducer,
  lines: linesReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = Promise<void>> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;
