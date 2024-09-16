import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import Overview from './overview';
import { Register } from './register';
import Edit from './edit';
import { useConfig } from '../../config/ConfigContext';
import api from '../../api/api';
import { useLines } from '../../hooks/useLines';
import { useCancellations } from '../../hooks/useCancellations';
import { useAuth } from '@entur/auth-provider';

export const Cancellations = ({ selectedOrganization }: any) => {
  const lines = useLines(selectedOrganization);
  const config = useConfig();
  const auth = useAuth();

  const { cancellations, refetch } = useCancellations(
    selectedOrganization.split(':')[0],
    selectedOrganization,
  );

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
            api={api(config, auth)}
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
            api={api(config, auth)}
            organization={selectedOrganization}
            refetch={refetch}
          />
        }
      />
    </Routes>
  );
};
