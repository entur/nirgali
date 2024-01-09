import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppWrapper } from './components/app-wrapper';
import firebase from 'firebase/compat/app';
import AuthProvider from '@entur/auth-provider';
import { ConfigContext } from './config/ConfigContext';
import { useLoginStatus } from './hooks/useLoginStatus';

import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import 'bootstrap/dist/css/bootstrap.css';
import './style/index.css';
import './style/base/base.scss';

const AuthenticatedApp = () => {
  const { loggedIn } = useLoginStatus();
  return <>{loggedIn && <AppWrapper />}</>;
};

const renderApp = (config) => {
  const root = createRoot(document.getElementById('root'));
  root.render(
    <AuthProvider
      auth0Config={{
        domain: config.auth0.domain,
        clientId: config.auth0.clientId,
        audience: config.auth0.audience,
        redirectUri: window.location.origin,
      }}
      auth0ClaimsNamespace={config.auth0.claimsNamespace}
    >
      <ConfigContext.Provider value={config}>
        <AuthenticatedApp />
      </ConfigContext.Provider>
    </AuthProvider>,
  );
};

const init = async () => {
  const configResponse = await fetch('/config.json');
  const config = await configResponse.json();

  const firebaseConfigResponse = await fetch('/__/firebase/init.json');
  firebase.initializeApp(await firebaseConfigResponse.json());

  renderApp(config);
};

init();
