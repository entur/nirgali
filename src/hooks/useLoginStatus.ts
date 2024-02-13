import { useAuth } from '@entur/auth-provider';
import { useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import firebase from 'firebase/compat/app';

const headers = (token: string) => ({
  headers: {
    Authorization: 'Bearer ' + token,
  },
});

const TOKEN_REFRESH_RATE = 60 * 1000;

export const useLoginStatus = () => {
  const auth = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);
  const config = useConfig();
  const authApi = config['auth-api'];

  useEffect(() => {
    const getToken = async () => {
      const token = await auth.getAccessToken();
      const authResponse = await fetch(authApi!, headers(token));
      const { firebaseToken } = await authResponse.json();
      await firebase.auth().signInWithCustomToken(firebaseToken);
      setLoggedIn(true);
    };

    if (auth.isAuthenticated) {
      getToken();
    }

    const updater = setInterval(() => {
      if (auth.isAuthenticated) {
        getToken();
      }
    }, TOKEN_REFRESH_RATE);

    return () => {
      clearInterval(updater);
    };
  }, [auth, authApi]);

  return { loggedIn };
};
