import { describe, it, expect } from 'vitest';
import organizationsReducer, {
  setSelectedOrganization,
  loadOrganizations,
  OrganizationsState,
} from './organizationsSlice';

describe('organizationsSlice', () => {
  const initialState: OrganizationsState = {
    organizations: [],
    allowedCodespaces: [],
    isAdmin: false,
    selectedOrganization: undefined,
    loading: false,
    error: null,
  };

  it('returns initial state', () => {
    expect(organizationsReducer(undefined, { type: 'unknown' })).toEqual(
      initialState,
    );
  });

  it('handles setSelectedOrganization', () => {
    const state = organizationsReducer(
      initialState,
      setSelectedOrganization('NSB:Authority:NSB'),
    );
    expect(state.selectedOrganization).toBe('NSB:Authority:NSB');
  });

  it('sets loading on pending', () => {
    const state = organizationsReducer(
      initialState,
      loadOrganizations.pending('req-id', { config: {}, auth: {} }),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('sets data on fulfilled', () => {
    const payload = {
      organizations: [{ id: 'NSB:Authority:NSB', name: 'NSB' }],
      allowedCodespaces: [{ id: 'NSB', permissions: ['MESSAGES'] }],
      isAdmin: false,
    };
    const state = organizationsReducer(
      { ...initialState, loading: true },
      loadOrganizations.fulfilled(payload, 'req-id', {
        config: {},
        auth: {},
      }),
    );
    expect(state.loading).toBe(false);
    expect(state.organizations).toHaveLength(1);
    expect(state.organizations[0].name).toBe('NSB');
    expect(state.allowedCodespaces[0].id).toBe('NSB');
  });

  it('sets error on rejected', () => {
    const state = organizationsReducer(
      { ...initialState, loading: true },
      loadOrganizations.rejected(new Error('Network error'), 'req-id', {
        config: {},
        auth: {},
      }),
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });
});
