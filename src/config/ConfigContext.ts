import React, { useContext } from 'react';

export interface Config {
  'deviation-messages-api'?: string;
  'journey-planner-api'?: string;
  'stop-places-api'?: string;
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
