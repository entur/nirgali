import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export type MessagesState = Message[];

export const messagesSlice = createSlice({
  name: 'messages',
  initialState: [] as MessagesState,
  reducers: {
    setMessages: (_state, action: PayloadAction<Message[]>) => action.payload,
    clearMessages: () => [],
  },
});

export const { setMessages, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
