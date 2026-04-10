import { describe, it, expect } from 'vitest';
import messagesReducer, {
  clearMessages,
  loadMessages,
  MessagesState,
} from './messagesSlice';

describe('messagesSlice', () => {
  const initialState: MessagesState = {
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
    expect(messagesReducer(undefined, { type: 'unknown' })).toEqual(
      initialState,
    );
  });

  it('clears messages', () => {
    const stateWithData = {
      ...initialState,
      data: [{ id: '1' }] as any,
      error: 'old error',
    };
    const state = messagesReducer(stateWithData, clearMessages());
    expect(state.data).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('sets loading on pending', () => {
    const state = messagesReducer(
      initialState,
      loadMessages.pending('req-id', thunkArg),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('sets data on fulfilled', () => {
    const messages = [
      {
        id: '1',
        situationNumber: 'NSB:SituationNumber:1',
        summary: { text: 'Test', attributes: { xmlLang: 'NO' } },
      },
    ] as any;
    const state = messagesReducer(
      { ...initialState, loading: true },
      loadMessages.fulfilled(messages, 'req-id', thunkArg),
    );
    expect(state.loading).toBe(false);
    expect(state.data).toHaveLength(1);
    expect(state.data[0].id).toBe('1');
  });

  it('sets error on rejected', () => {
    const state = messagesReducer(
      { ...initialState, loading: true },
      loadMessages.rejected(new Error('API error'), 'req-id', thunkArg),
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('API error');
  });
});
