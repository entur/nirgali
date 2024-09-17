import { useCallback, useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';
import { useAuth } from '@entur/auth-provider';

export const useExtrajourneys = (
  codespace: string,
  authority: string,
  showCompletedTrips: boolean,
) => {
  const auth = useAuth();
  const [extrajourneys, setExtrajourneys] = useState([]);
  const config = useConfig();

  const getExtrajourneys = useCallback(async () => {
    const response = await api(config, auth).getExtrajourneys(
      codespace,
      authority,
      showCompletedTrips,
    );
    if (response.data) {
      setExtrajourneys(response.data.extrajourneys);
    } else {
      console.log('Could not find any extrajourneys for this organization');
    }
  }, [codespace, authority, config, auth, showCompletedTrips]);

  useEffect(() => {
    if (codespace && authority) {
      getExtrajourneys();
    }
  }, [codespace, authority, getExtrajourneys, showCompletedTrips]);

  return { extrajourneys, refetch: getExtrajourneys };
};
