import React, { useContext } from 'react';

interface Config {
  'auth-api'?: string;
}

export const ConfigContext = React.createContext<Config>({});

export const useConfig = () => {
  return useContext(ConfigContext);
};
