import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import { useAuth } from 'react-oidc-context';
import { Header } from './Header';
import { AppRouter } from './AppRouter';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useOrganizations } from '../../hooks/useOrganizations';
import { setSelectedOrganization } from '../../reducers/organizationsSlice';

export const App = () => {
  const dispatch = useAppDispatch();
  const { organizations, allowedCodespaces, isAdmin } = useOrganizations();
  const selectedOrganization = useAppSelector(
    (state) => state.organizations.selectedOrganization,
  );

  useEffect(() => {
    if (organizations.length && !selectedOrganization) {
      dispatch(setSelectedOrganization(organizations[0].id));
    }
  }, [organizations, selectedOrganization, dispatch]);

  const { signoutRedirect } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        organizations={organizations}
        selectedOrganization={selectedOrganization}
        onSelectOrganization={(id) => dispatch(setSelectedOrganization(id))}
        onLogout={() =>
          signoutRedirect({ post_logout_redirect_uri: window.location.origin })
        }
      />
      <Toolbar />
      <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
        {selectedOrganization && (
          <AppRouter
            allowedCodespaces={allowedCodespaces}
            isAdmin={isAdmin}
            selectedOrganization={selectedOrganization}
          />
        )}
      </Container>
    </Box>
  );
};
