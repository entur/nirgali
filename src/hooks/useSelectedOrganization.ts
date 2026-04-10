import { createContext, useContext } from 'react';

export const SelectedOrganizationContext = createContext<string>('');

export const useSelectedOrganization = () => {
  return useContext(SelectedOrganizationContext);
};
