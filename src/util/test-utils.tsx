import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  cleanup,
  render,
  renderHook,
  RenderOptions,
  RenderResult,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { afterEach } from 'vitest';
import { ReactElement } from 'react';
import theme from '../theme/theme';
import { ConfigContext, Config } from '../config/ConfigContext';
import notificationReducer from '../reducers/notificationSlice';
import organizationsReducer from '../reducers/organizationsSlice';
import messagesReducer from '../reducers/messagesSlice';
import cancellationsReducer from '../reducers/cancellationsSlice';
import extrajourneysReducer from '../reducers/extrajourneysSlice';
import linesReducer from '../reducers/linesSlice';
import operatorsReducer from '../reducers/operatorsSlice';

afterEach(() => {
  cleanup();
});

const testReducer = combineReducers({
  notification: notificationReducer,
  organizations: organizationsReducer,
  messages: messagesReducer,
  cancellations: cancellationsReducer,
  extrajourneys: extrajourneysReducer,
  lines: linesReducer,
  operators: operatorsReducer,
});

export type TestRootState = ReturnType<typeof testReducer>;

export function createTestStore(preloadedState?: Partial<TestRootState>) {
  return configureStore({
    reducer: testReducer,
    preloadedState: preloadedState as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

const defaultConfig: Config = {
  'deviation-messages-api': 'http://test-api',
  'journey-planner-api': 'http://test-journey-planner',
  'stop-places-api': 'http://test-stop-places',
};

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<TestRootState>;
  routerProps?: { initialEntries?: string[] };
  config?: Config;
}

function createWrapper({
  preloadedState,
  routerProps,
  config,
}: Pick<ExtendedRenderOptions, 'preloadedState' | 'routerProps' | 'config'>) {
  const testStore = preloadedState
    ? createTestStore(preloadedState)
    : createTestStore();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    let wrapped = (
      <Provider store={testStore}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </Provider>
    );

    if (config) {
      wrapped = (
        <ConfigContext.Provider value={config}>
          {wrapped}
        </ConfigContext.Provider>
      );
    } else {
      wrapped = (
        <ConfigContext.Provider value={defaultConfig}>
          {wrapped}
        </ConfigContext.Provider>
      );
    }

    if (routerProps) {
      wrapped = (
        <MemoryRouter initialEntries={routerProps.initialEntries}>
          {wrapped}
        </MemoryRouter>
      );
    }

    return wrapped;
  };
}

function customRender(
  ui: ReactElement,
  options: ExtendedRenderOptions = {},
): RenderResult {
  const { preloadedState, routerProps, config, ...renderOptions } = options;
  return render(ui, {
    wrapper: createWrapper({ preloadedState, routerProps, config }),
    ...renderOptions,
  });
}

function customRenderHook<Result, Props>(
  hook: (props: Props) => Result,
  options: ExtendedRenderOptions = {},
) {
  const { preloadedState, routerProps, config, ...renderOptions } = options;
  return renderHook(hook, {
    wrapper: createWrapper({ preloadedState, routerProps, config }),
    ...renderOptions,
  });
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };
export { customRenderHook as renderHookWithProviders };
