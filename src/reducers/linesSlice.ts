import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LinesState = any[];

export const linesSlice = createSlice({
  name: 'lines',
  initialState: [] as LinesState,
  reducers: {
    setLines: (_state, action: PayloadAction<any[]>) => action.payload,
    clearLines: () => [],
  },
});

export const { setLines, clearLines } = linesSlice.actions;
export default linesSlice.reducer;
