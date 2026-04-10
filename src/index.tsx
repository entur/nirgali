import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { nb } from 'date-fns/locale/nb';
import { Provider } from 'react-redux';
import { AuthProvider, hasAuthParams, useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import theme from './theme/theme';
import { store } from './store/store';
import { App } from './components/app/App';
import { Config, ConfigContext } from './config/ConfigContext';

const AuthenticatedApp = () => {
  const { isAuthenticated, activeNavigator, isLoading, signinRedirect } =
    useAuth();

  useEffect(() => {
    if (
      !hasAuthParams() &&
      !isAuthenticated &&
      !activeNavigator &&
      !isLoading
    ) {
      signinRedirect().catch((err: unknown) => {
        throw err;
      });
    }
  }, [isAuthenticated, activeNavigator, isLoading, signinRedirect]);

  if (!isAuthenticated) {
    return null;
  }

  return <App />;
};

const renderApp = (config: Config) => {
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement!);

  root.render(
    <ConfigContext.Provider value={config}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nb}>
          <Provider store={store}>
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
              <AuthenticatedApp />
            </AuthProvider>
          </Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </ConfigContext.Provider>,
  );
};

const init = async () => {
  const configResponse = await fetch('/config.json');
  const config = await configResponse.json();
  renderApp(config);
};

init();
