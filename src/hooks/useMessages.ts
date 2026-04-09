import { useEffect } from 'react';
import { useConfig } from '../config/ConfigContext';
import { useAuth } from 'react-oidc-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadMessages } from '../reducers/messagesSlice';

export const useMessages = (codespace: string, authority: string) => {
  const auth = useAuth();
  const config = useConfig();
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.messages.data);

  useEffect(() => {
    if (codespace && authority) {
      dispatch(loadMessages({ config, auth, codespace, authority }));
    }
  }, [dispatch, codespace, authority, config, auth]);

  return messages;
};
