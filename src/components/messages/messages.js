import { Routes, Route } from 'react-router-dom';
import Overview from './overview';
import Register from './register';
import Edit from './edit';
import api from '../../api/api';
import { useConfig } from '../../config/ConfigContext';
import { useLines } from '../../hooks/useLines';
import { useMessages } from '../../hooks/useMessages';

export const Messages = ({ selectedOrganization }) => {
  const lines = useLines(selectedOrganization);
  const config = useConfig();

  const messages = useMessages(
    selectedOrganization.split(':')[0],
    selectedOrganization,
  );

  return (
    <Routes>
      <Route path="/" element={<Overview messages={messages} />} />
      {messages.length && (
        <Route
          path="/:id"
          element={
            <Edit
              messages={messages}
              lines={lines}
              api={api(config)}
              organization={selectedOrganization}
            />
          }
        />
      )}
      <Route
        path="/ny"
        element={
          <Register
            api={api(config)}
            lines={lines}
            organization={selectedOrganization}
          />
        }
      />
    </Routes>
  );
};
