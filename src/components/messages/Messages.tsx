import { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import Overview from './Overview';
import Register from './Register';
import Edit from './Edit';
import api from '../../api/api';
import { useConfig } from '../../config/ConfigContext';
import { useLines } from '../../hooks/useLines';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from 'react-oidc-context';

interface MessagesProps {
  selectedOrganization: string;
}

export const Messages = ({ selectedOrganization }: MessagesProps) => {
  const auth = useAuth();
  const lines = useLines(selectedOrganization);
  const config = useConfig();

  const messages = useMessages(
    selectedOrganization.split(':')[0],
    selectedOrganization,
  );

  // Constructed once per config/auth change rather than on every render, so
  // effects keyed on the api object do not refire continuously.
  const apiClient = useMemo(() => api(config, auth), [config, auth]);

  return (
    <Routes>
      <Route path="/" element={<Overview messages={messages} />} />
      {messages.length > 0 && (
        <Route
          path="/:id"
          element={
            <Edit
              messages={messages}
              lines={lines}
              api={apiClient}
              organization={selectedOrganization}
            />
          }
        />
      )}
      <Route
        path="/ny"
        element={
          <Register
            api={apiClient}
            lines={lines}
            organization={selectedOrganization}
          />
        }
      />
    </Routes>
  );
};
