import { AppThunk } from '../store/store';
import { setOrganizations } from '../reducers/organizationsSlice';
import api from '../api/api';
import { Config } from '../config/ConfigContext';

export const loadOrganizations =
  (config: Config, auth: any): AppThunk =>
  async (dispatch) => {
    const userContextResponse = await api(config, auth).getUserContext();
    const { allowedCodespaces, isAdmin } = userContextResponse.data.userContext;
    const allowedCodespaceIds = allowedCodespaces.map(
      (codespace: any) => codespace.id,
    );

    if (allowedCodespaceIds.length === 0 && !isAdmin) {
      auth.signoutRedirect();
      return;
    }

    const response = await api(config).getAuthorities();
    const authorities = response.data.authorities.filter(
      (authority: any) =>
        isAdmin || allowedCodespaceIds.includes(authority.id.split(':')[0]),
    );

    if (authorities.length === 0) {
      auth.signoutRedirect();
      return;
    }

    dispatch(
      setOrganizations({
        organizations: authorities.map(({ id, name }: any) => ({ id, name })),
        allowedCodespaces,
        isAdmin,
      }),
    );
  };
