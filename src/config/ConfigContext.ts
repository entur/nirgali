import React, { useContext } from 'react';
import { OidcClientSettings } from 'oidc-client-ts';

export interface Config {
  'deviation-messages-api'?: string;
  'journey-planner-api'?: string;
  'stop-places-api'?: string;
  oidcConfig?: OidcClientSettings;
}

export const ConfigContext = React.createContext<Config>({});

export const useConfig = () => {
  return useContext(ConfigContext);
};
