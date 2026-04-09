import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../api/api';
import { Config } from '../config/ConfigContext';

export interface Message {
  id: string;
  creationTime: string;
  participantRef: string;
  progress: string;
  reportType: string;
  severity: string;
  situationNumber: string;
  advice?: {
    attributes: { xmlLang: string };
    text: string;
  };
  affects: any;
  description?: {
    attributes: { xmlLang: string };
    text: string;
  };
  infoLinks?: {
    infoLink: {
      uri: string;
      label?: string;
    };
  };
  source: {
    sourceType: string;
  };
  summary: {
    attributes: { xmlLang: string };
    text: string;
  };
  validityPeriod: {
    startTime: string;
    endTime?: string;
  };
}

export interface MessagesState {
  data: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  data: [],
  loading: false,
  error: null,
};

export const loadMessages = createAsyncThunk(
  'messages/load',
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
    const response = await api(config, auth).getMessages(codespace, authority);
    return structuredClone(response.data.situationElements) as Message[];
  },
);

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(loadMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load messages';
      });
  },
});

export const { clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
