import { useCallback, useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';
import { useAuth } from 'react-oidc-context';

export const useCancellations = (codespace: string, authority: string) => {
  const auth = useAuth();
  const [cancellations, setCancellations] = useState([]);
  const config = useConfig();

  const getCancellations = useCallback(async () => {
    const response = await api(config, auth).getCancellations(
      codespace,
      authority,
    );
    if (response.data) {
      setCancellations(structuredClone(response.data.cancellations));
    } else {
      console.log('Could not find any cancellations for this organization');
    }
  }, [codespace, authority, config, auth]);

  useEffect(() => {
    if (codespace && authority) {
      getCancellations();
    }
  }, [codespace, authority, getCancellations]);

  return { cancellations, refetch: getCancellations };
};
