import { describe, it, expect } from 'vitest';
import organizationsReducer, {
  setOrganizations,
  setSelectedOrganization,
  OrganizationsState,
} from './organizationsSlice';

describe('organizationsSlice', () => {
  const initialState: OrganizationsState = {
    organizations: [],
    allowedCodespaces: [],
    isAdmin: false,
    selectedOrganization: undefined,
  };

  it('returns initial state', () => {
    expect(organizationsReducer(undefined, { type: 'unknown' })).toEqual(
      initialState,
    );
  });

  it('handles setOrganizations', () => {
    const payload = {
      organizations: [{ id: 'NSB:Authority:NSB', name: 'NSB' }],
      allowedCodespaces: [{ id: 'NSB', permissions: ['MESSAGES'] }],
      isAdmin: false,
    };

    const state = organizationsReducer(initialState, setOrganizations(payload));
    expect(state.organizations).toHaveLength(1);
    expect(state.organizations[0].name).toBe('NSB');
    expect(state.allowedCodespaces[0].id).toBe('NSB');
  });

  it('handles setSelectedOrganization', () => {
    const state = organizationsReducer(
      initialState,
      setSelectedOrganization('NSB:Authority:NSB'),
    );
    expect(state.selectedOrganization).toBe('NSB:Authority:NSB');
  });
});
