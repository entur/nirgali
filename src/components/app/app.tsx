// @ts-ignore
import Background from '../../img/background.jpg';
import { useOrganizations } from '../../hooks/useOrganizations';
import NavBar from './navbar';
import React, { useEffect, useState } from 'react';
import { AppRouter } from './appRouter';
import { SelectedOrganizationContext } from '../../hooks/useSelectedOrganization';
import { useAuth } from 'react-oidc-context';

export const App = () => {
  const { organizations, allowedCodespaces, isAdmin } = useOrganizations();
  const [selectedOrganization, setSelectedOrganization] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (organizations.length && !selectedOrganization) {
      // TODO store selected organization in localstorage?
      setSelectedOrganization(organizations[0].id);
    }
  }, [organizations, selectedOrganization]);

  const { signoutRedirect } = useAuth();

  return (
    <>
      <img className="background-image" src={Background} alt="" />
      <NavBar
        onSelectOrganization={setSelectedOrganization}
        user={organizations.map((org) => org.id)}
        name={organizations.map((org) => org.name)}
        logout={() =>
          signoutRedirect({ post_logout_redirect_uri: window.location.origin })
        }
      />
      {selectedOrganization && (
        <SelectedOrganizationContext.Provider value={selectedOrganization}>
          <AppRouter allowedCodespaces={allowedCodespaces} isAdmin={isAdmin} />
        </SelectedOrganizationContext.Provider>
      )}
    </>
  );
};
