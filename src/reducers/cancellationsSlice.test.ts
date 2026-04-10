import { describe, it, expect } from 'vitest';
import cancellationsReducer, {
  clearCancellations,
  loadCancellations,
  CancellationsState,
} from './cancellationsSlice';

describe('cancellationsSlice', () => {
  const initialState: CancellationsState = {
    data: [],
    loading: false,
    error: null,
  };

  const thunkArg = {
    config: {},
    auth: {},
    codespace: 'NSB',
    authority: 'NSB:Authority:NSB',
  };

  it('returns initial state', () => {
    expect(cancellationsReducer(undefined, { type: 'unknown' })).toEqual(
      initialState,
    );
  });

  it('clears cancellations', () => {
    const state = cancellationsReducer(
      { ...initialState, data: [{ id: '1' }] as any },
      clearCancellations(),
    );
    expect(state.data).toEqual([]);
  });

  it('sets loading on pending', () => {
    const state = cancellationsReducer(
      initialState,
      loadCancellations.pending('req-id', thunkArg),
    );
    expect(state.loading).toBe(true);
  });

  it('sets data on fulfilled', () => {
    const data = [{ id: '1', estimatedVehicleJourney: {} }] as any;
    const state = cancellationsReducer(
      { ...initialState, loading: true },
      loadCancellations.fulfilled(data, 'req-id', thunkArg),
    );
    expect(state.loading).toBe(false);
    expect(state.data).toHaveLength(1);
  });

  it('sets error on rejected', () => {
    const state = cancellationsReducer(
      { ...initialState, loading: true },
      loadCancellations.rejected(new Error('fail'), 'req-id', thunkArg),
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('fail');
  });
});
