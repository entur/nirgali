import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: OrganizationsState = {
  organizations: [],
  allowedCodespaces: [],
  isAdmin: false,
  selectedOrganization: undefined,
};

export const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    setOrganizations: (
      state,
      action: PayloadAction<{
        organizations: Organization[];
        allowedCodespaces: Codespace[];
        isAdmin: boolean;
      }>,
    ) => {
      state.organizations = action.payload.organizations;
      state.allowedCodespaces = action.payload.allowedCodespaces;
      state.isAdmin = action.payload.isAdmin;
    },
    setSelectedOrganization: (state, action: PayloadAction<string>) => {
      state.selectedOrganization = action.payload;
    },
  },
});

export const { setOrganizations, setSelectedOrganization } =
  organizationsSlice.actions;
export default organizationsSlice.reducer;
