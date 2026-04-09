import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/api';
import { Config } from '../config/ConfigContext';

export interface LinesState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: LinesState = {
  data: [],
  loading: false,
  error: null,
};

export const loadLines = createAsyncThunk(
  'lines/load',
  async ({
    config,
    selectedOrganization,
  }: {
    config: Config;
    selectedOrganization: string;
  }) => {
    const response = await api(config).getLines(selectedOrganization);
    return structuredClone(response.data.lines) as any[];
  },
);

export const linesSlice = createSlice({
  name: 'lines',
  initialState,
  reducers: {
    clearLines: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLines.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(loadLines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load lines';
      });
  },
});

export const { clearLines } = linesSlice.actions;
export default linesSlice.reducer;
