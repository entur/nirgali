import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Operator } from '../hooks/useOperators';

export type OperatorsState = Operator[];

export const operatorsSlice = createSlice({
  name: 'operators',
  initialState: [] as OperatorsState,
  reducers: {
    setOperators: (_state, action: PayloadAction<Operator[]>) => action.payload,
    clearOperators: () => [],
  },
});

export const { setOperators, clearOperators } = operatorsSlice.actions;
export default operatorsSlice.reducer;
