import { AppThunk } from '../store/store';
import { setCancellations } from '../reducers/cancellationsSlice';
import api from '../api/api';
import { Config } from '../config/ConfigContext';

export const loadCancellations =
  (config: Config, auth: any, codespace: string, authority: string): AppThunk =>
  async (dispatch) => {
    if (!codespace || !authority) return;

    const response = await api(config, auth).getCancellations(
      codespace,
      authority,
    );
    if (response.data) {
      dispatch(setCancellations(structuredClone(response.data.cancellations)));
    }
  };
