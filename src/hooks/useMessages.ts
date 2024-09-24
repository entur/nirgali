import { useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';
import { useAuth } from 'react-oidc-context';

export const useMessages = (codespace: string, authority: string) => {
  const auth = useAuth();
  const [messages, setMessages] = useState([]);
  const config = useConfig();

  useEffect(() => {
    const getMessages = async () => {
      const response = await api(config, auth).getMessages(
        codespace,
        authority,
      );
      if (response.data) {
        setMessages(structuredClone(response.data.situationElements));
      } else {
        console.log('Could not find any lines for this organization');
      }
    };

    if (codespace && authority) {
      getMessages();
    }
  }, [codespace, authority, config, auth]);

  return messages;
};
