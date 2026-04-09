import { AppThunk } from '../store/store';
import { setExtrajourneys } from '../reducers/extrajourneysSlice';
import api from '../api/api';
import { Config } from '../config/ConfigContext';

export const loadExtrajourneys =
  (
    config: Config,
    auth: any,
    codespace: string,
    authority: string,
    showCompletedTrips: boolean,
  ): AppThunk =>
  async (dispatch) => {
    if (!codespace || !authority) return;

    const response = await api(config, auth).getExtrajourneys(
      codespace,
      authority,
      showCompletedTrips,
    );
    if (response.data) {
      dispatch(setExtrajourneys(structuredClone(response.data.extrajourneys)));
    }
  };
