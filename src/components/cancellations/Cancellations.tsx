import { useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import Overview from './Overview';
import { Register } from './Register';
import Edit from './Edit';
import { useConfig } from '../../config/ConfigContext';
import api from '../../api/api';
import { useLines } from '../../hooks/useLines';
import { useCancellations } from '../../hooks/useCancellations';
import { useAuth } from 'react-oidc-context';

interface CancellationsProps {
  selectedOrganization: string;
}

export const Cancellations = ({ selectedOrganization }: CancellationsProps) => {
  const lines = useLines(selectedOrganization);
  const config = useConfig();
  const auth = useAuth();

  const { cancellations, refetch } = useCancellations(
    selectedOrganization.split(':')[0],
    selectedOrganization,
  );

  // Constructed once per config/auth change rather than on every render, so
  // effects keyed on the api object do not refire continuously.
  const apiClient = useMemo(() => api(config, auth), [config, auth]);

  return (
    <Routes>
      <Route
        path="/"
        element={<Overview cancellations={cancellations} lines={lines} />}
      />
      <Route
        path="/:id"
        element={
          <Edit
            cancellations={cancellations}
            lines={lines}
            api={apiClient}
            organization={selectedOrganization}
            refetch={refetch}
          />
        }
      />
      <Route
        path="/ny"
        element={
          <Register
            lines={lines}
            api={apiClient}
            organization={selectedOrganization}
            refetch={refetch}
          />
        }
      />
    </Routes>
  );
};
