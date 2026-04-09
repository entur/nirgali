import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/api';
import { Config } from '../config/ConfigContext';

export interface Cancellation {
  id: string;
  estimatedVehicleJourney: {
    cancellation: boolean;
    lineRef: string;
    directionRef: string;
    dataSource: string;
    estimatedVehicleJourneyCode: string;
    expiresAtEpochMs: number;
    extraJourney: boolean;
    groupOfLinesRef: string;
    isCompleteStopSequence: boolean;
    monitored: boolean;
    operatorRef: string;
    publishedLineName: string;
    recordedAtTime: string;
    routeRef: string;
    vehicleMode: string;
    estimatedCalls: {
      estimatedCall: any[];
    };
    framedVehicleJourneyRef: {
      dataFrameRef: string;
      datedVehicleJourneyRef: string;
    };
  };
}

export interface CancellationsState {
  data: Cancellation[];
  loading: boolean;
  error: string | null;
}

const initialState: CancellationsState = {
  data: [],
  loading: false,
  error: null,
};

export const loadCancellations = createAsyncThunk(
  'cancellations/load',
  async ({
    config,
    auth,
    codespace,
    authority,
  }: {
    config: Config;
    auth: any;
    codespace: string;
    authority: string;
  }) => {
    const response = await api(config, auth).getCancellations(
      codespace,
      authority,
    );
    return structuredClone(response.data.cancellations) as Cancellation[];
  },
);

export const cancellationsSlice = createSlice({
  name: 'cancellations',
  initialState,
  reducers: {
    clearCancellations: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCancellations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCancellations.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(loadCancellations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load cancellations';
      });
  },
});

export const { clearCancellations } = cancellationsSlice.actions;
export default cancellationsSlice.reducer;
