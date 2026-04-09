import { AppThunk } from '../store/store';
import { setMessages } from '../reducers/messagesSlice';
import api from '../api/api';
import { Config } from '../config/ConfigContext';

export const loadMessages =
  (config: Config, auth: any, codespace: string, authority: string): AppThunk =>
  async (dispatch) => {
    if (!codespace || !authority) return;

    const response = await api(config, auth).getMessages(codespace, authority);
    if (response.data) {
      dispatch(setMessages(structuredClone(response.data.situationElements)));
    }
  };
