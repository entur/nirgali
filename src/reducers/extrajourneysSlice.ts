import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/api';
import { Config } from '../config/ConfigContext';
import { ExtraJourney } from '../components/extrajourneys/types';

export interface ExtrajourneysState {
  data: ExtraJourney[];
  loading: boolean;
  error: string | null;
}

const initialState: ExtrajourneysState = {
  data: [],
  loading: false,
  error: null,
};

export const loadExtrajourneys = createAsyncThunk(
  'extrajourneys/load',
  async ({
    config,
    auth,
    codespace,
    authority,
    showCompletedTrips,
  }: {
    config: Config;
    auth: any;
    codespace: string;
    authority: string;
    showCompletedTrips: boolean;
  }) => {
    const response = await api(config, auth).getExtrajourneys(
      codespace,
      authority,
      showCompletedTrips,
    );
    return structuredClone(response.data.extrajourneys) as ExtraJourney[];
  },
);

export const extrajourneysSlice = createSlice({
  name: 'extrajourneys',
  initialState,
  reducers: {
    clearExtrajourneys: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadExtrajourneys.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadExtrajourneys.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(loadExtrajourneys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load extra journeys';
      });
  },
});

export const { clearExtrajourneys } = extrajourneysSlice.actions;
export default extrajourneysSlice.reducer;
