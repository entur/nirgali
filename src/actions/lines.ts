import { AppThunk } from '../store/store';
import { setLines } from '../reducers/linesSlice';
import api from '../api/api';
import { Config } from '../config/ConfigContext';

export const loadLines =
  (config: Config, selectedOrganization: string): AppThunk =>
  async (dispatch) => {
    const response = await api(config).getLines(selectedOrganization);
    if (response.data) {
      dispatch(setLines(structuredClone(response.data.lines)));
    }
  };
