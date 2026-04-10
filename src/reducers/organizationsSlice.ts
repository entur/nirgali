import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../api/api';
import { Config } from '../config/ConfigContext';

export interface Organization {
  id: string;
  name: string;
}

export interface Codespace {
  id: string;
  permissions: string[];
}

export interface OrganizationsState {
  organizations: Organization[];
  allowedCodespaces: Codespace[];
  isAdmin: boolean;
  selectedOrganization: string | undefined;
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationsState = {
  organizations: [],
  allowedCodespaces: [],
  isAdmin: false,
  selectedOrganization: undefined,
  loading: false,
  error: null,
};

export const loadOrganizations = createAsyncThunk(
  'organizations/load',
  async ({ config, auth }: { config: Config; auth: any }) => {
    const userContextResponse = await api(config, auth).getUserContext();
    const { allowedCodespaces, isAdmin } = userContextResponse.data.userContext;
    const allowedCodespaceIds = allowedCodespaces.map(
      (codespace: any) => codespace.id,
    );

    if (allowedCodespaceIds.length === 0 && !isAdmin) {
      auth.signoutRedirect();
      return {
        organizations: [] as Organization[],
        allowedCodespaces,
        isAdmin,
      };
    }

    const response = await api(config).getAuthorities();
    const authorities = response.data.authorities.filter(
      (authority: any) =>
        isAdmin || allowedCodespaceIds.includes(authority.id.split(':')[0]),
    );

    if (authorities.length === 0) {
      auth.signoutRedirect();
      return {
        organizations: [] as Organization[],
        allowedCodespaces,
        isAdmin,
      };
    }

    return {
      organizations: authorities.map(({ id, name }: any) => ({ id, name })),
      allowedCodespaces,
      isAdmin,
    };
  },
);

export const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    setSelectedOrganization: (state, action: PayloadAction<string>) => {
      state.selectedOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadOrganizations.fulfilled, (state, action) => {
        state.organizations = action.payload.organizations;
        state.allowedCodespaces = action.payload.allowedCodespaces;
        state.isAdmin = action.payload.isAdmin;
        state.loading = false;
      })
      .addCase(loadOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load organizations';
      });
  },
});

export const { setSelectedOrganization } = organizationsSlice.actions;
export default organizationsSlice.reducer;
