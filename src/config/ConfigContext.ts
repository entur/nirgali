import React, { useContext } from 'react';

export interface Config {
  auth0?: {
    domain: string;
    clientId: string;
    audience: string;
    redirectUri: string;
    claimsNamespace: string;
  };
}

export const ConfigContext = React.createContext<Config>({});

export const useConfig = () => {
  return useContext(ConfigContext);
};
