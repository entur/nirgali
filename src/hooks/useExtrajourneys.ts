import { useCallback, useEffect } from 'react';
import { useConfig } from '../config/ConfigContext';
import { useAuth } from 'react-oidc-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadExtrajourneys } from '../actions/extrajourneys';

export const useExtrajourneys = (
  codespace: string,
  authority: string,
  showCompletedTrips: boolean,
) => {
  const auth = useAuth();
  const config = useConfig();
  const dispatch = useAppDispatch();
  const extrajourneys = useAppSelector((state) => state.extrajourneys);

  const fetchExtrajourneys = useCallback(() => {
    if (codespace && authority) {
      return dispatch(
        loadExtrajourneys(
          config,
          auth,
          codespace,
          authority,
          showCompletedTrips,
        ),
      );
    }
    return Promise.resolve();
  }, [dispatch, codespace, authority, config, auth, showCompletedTrips]);

  useEffect(() => {
    fetchExtrajourneys();
  }, [fetchExtrajourneys]);

  return { extrajourneys, refetch: fetchExtrajourneys };
};
