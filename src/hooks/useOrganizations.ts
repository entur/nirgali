import { useEffect } from 'react';
import { useConfig } from '../config/ConfigContext';
import { useAuth } from 'react-oidc-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadOrganizations } from '../reducers/organizationsSlice';

export const useOrganizations = () => {
  const auth = useAuth();
  const config = useConfig();
  const dispatch = useAppDispatch();

  const { organizations, allowedCodespaces, isAdmin, loading } = useAppSelector(
    (state) => state.organizations,
  );

  useEffect(() => {
    if (organizations.length === 0 && !loading) {
      dispatch(loadOrganizations({ config, auth }));
    }
  }, [dispatch, config, auth, organizations.length, loading]);

  return { organizations, allowedCodespaces, isAdmin, loading };
};
