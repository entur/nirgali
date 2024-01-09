// @ts-ignore
import Background from '../img/background.jpg';
import { useOrganizations } from '../hooks/useOrganizations';
import NavBar from './navbar';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@entur/auth-provider';
import { App } from './app';

export const AppWrapper = () => {
  const organizations = useOrganizations();
  const [selectedOrganization, setSelectedOrganization] = useState<
    string | undefined
  >();
  const auth = useAuth();

  useEffect(() => {
    if (organizations.length && !selectedOrganization) {
      // TODO store selected organization in localstorage?
      setSelectedOrganization(organizations[0].id);
    }
  }, [organizations, selectedOrganization]);

  return (
    <>
      <img className="background-image" src={Background} alt="" />
      <NavBar
        onSelectOrganization={setSelectedOrganization}
        user={organizations.map((org) => org.id)}
        name={organizations.map((org) => org.name)}
        logout={() => auth.logout({ returnTo: window.location.origin })}
      />
      {selectedOrganization && (
        <App selectedOrganization={selectedOrganization} />
      )}
    </>
  );
};
