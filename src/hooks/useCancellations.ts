import { useCallback, useEffect } from 'react';
import { useConfig } from '../config/ConfigContext';
import { useAuth } from 'react-oidc-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadCancellations } from '../reducers/cancellationsSlice';

export const useCancellations = (codespace: string, authority: string) => {
  const auth = useAuth();
  const config = useConfig();
  const dispatch = useAppDispatch();
  const cancellations = useAppSelector((state) => state.cancellations.data);

  const fetchCancellations = useCallback(() => {
    if (codespace && authority) {
      return dispatch(
        loadCancellations({ config, auth, codespace, authority }),
      );
    }
    return Promise.resolve();
  }, [dispatch, codespace, authority, config, auth]);

  useEffect(() => {
    fetchCancellations();
  }, [fetchCancellations]);

  return { cancellations, refetch: fetchCancellations };
};
