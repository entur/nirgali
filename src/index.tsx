import { createRoot } from 'react-dom/client';
import { App } from './components/app/app';
import { Config, ConfigContext } from './config/ConfigContext';
import { AuthProvider, hasAuthParams, useAuth } from 'react-oidc-context';

import 'bootstrap/dist/css/bootstrap.css';
import './style/index.css';
import './style/base/base.scss';
import { useEffect } from 'react';

const AuthenticatedApp = () => {
  const { isAuthenticated, activeNavigator, isLoading, signinRedirect, user } =
    useAuth();

  useEffect(() => {
    if (
      !hasAuthParams() &&
      !isAuthenticated &&
      !activeNavigator &&
      !isLoading
    ) {
      signinRedirect().catch((err: any) => {
        throw err;
      });
    }
  }, [isAuthenticated, activeNavigator, isLoading, signinRedirect]);

  if (!isAuthenticated) {
    return null;
  } else {
    return <App />;
  }
};

const renderApp = (config: Config) => {
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement!);

  root.render(
    <AuthProvider
      {...config.oidcConfig}
      onSigninCallback={() => {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }}
      redirect_uri={window.location.origin}
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

  renderApp(config);
};

init();
