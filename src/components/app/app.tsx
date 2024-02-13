// @ts-ignore
import Background from '../../img/background.jpg';
import { useOrganizations } from '../../hooks/useOrganizations';
import NavBar from './navbar';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@entur/auth-provider';
import { AppRouter } from './appRouter';
import { useLoginStatus } from '../../hooks/useLoginStatus';
import { SelectedOrganizationContext } from '../../hooks/useSelectedOrganization';

export const AuthenticatedApp = () => {
  const { loggedIn } = useLoginStatus();

  if (!loggedIn) {
    return null;
  }

  return <App />;
};
export const App = () => {
  const organizations = useOrganizations();
  const [selectedOrganization, setSelectedOrganization] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (organizations.length && !selectedOrganization) {
      // TODO store selected organization in localstorage?
      setSelectedOrganization(organizations[0].id);
    }
  }, [organizations, selectedOrganization]);

  const { logout } = useAuth();

  return (
    <>
      <img className="background-image" src={Background} alt="" />
      <NavBar
        onSelectOrganization={setSelectedOrganization}
        user={organizations.map((org) => org.id)}
        name={organizations.map((org) => org.name)}
        logout={() => logout({ returnTo: window.location.origin })}
      />
      {selectedOrganization && (
        <SelectedOrganizationContext.Provider value={selectedOrganization}>
          <AppRouter />
        </SelectedOrganizationContext.Provider>
      )}
    </>
  );
};
