import React, { useContext } from 'react';

export const SelectedOrganizationContext = React.createContext<string>('');

export const useSelectedOrganization = () => {
  return useContext(SelectedOrganizationContext);
};
