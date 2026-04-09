import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExtraJourney } from '../components/extrajourneys/types';

export type ExtrajourneysState = ExtraJourney[];

export const extrajourneysSlice = createSlice({
  name: 'extrajourneys',
  initialState: [] as ExtrajourneysState,
  reducers: {
    setExtrajourneys: (_state, action: PayloadAction<ExtraJourney[]>) =>
      action.payload,
    clearExtrajourneys: () => [],
  },
});

export const { setExtrajourneys, clearExtrajourneys } =
  extrajourneysSlice.actions;
export default extrajourneysSlice.reducer;
