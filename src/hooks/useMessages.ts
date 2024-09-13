import { useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';

export const useMessages = (codespace: string, authority: string) => {
  const [messages, setMessages] = useState([]);
  const config = useConfig();

  useEffect(() => {
    const getMessages = async () => {
      const response = await api(config).getMessages(codespace, authority);
      if (response.data) {
        setMessages(response.data.situationElements);
      } else {
        console.log('Could not find any lines for this organization');
      }
    };

    if (codespace && authority) {
      getMessages();
    }
  }, [codespace, authority, config]);

  return messages;
};
