import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import Overview from './overview';
import { Register } from './register';
import Edit from './edit';
import { useConfig } from '../../config/ConfigContext';
import api from '../../api/api';
import { useLines } from '../../hooks/useLines';

export const Cancellations = ({ selectedOrganization }: any) => {
  const [cancellations, setCancellations] = useState([]);
  const lines = useLines(selectedOrganization);
  const config = useConfig();

  const db = firebase.firestore();

  useEffect(() => {
    const codespace = selectedOrganization.split(':')[0];
    const authority = selectedOrganization;

    if (!codespace || !authority) {
      return;
    }

    const unsubscribeSnapshotListener = db
      .collection(
        `codespaces/${codespace}/authorities/${authority}/cancellations`,
      )
      .onSnapshot((querySnapshot: any) =>
        setCancellations(
          querySnapshot.size > 0
            ? querySnapshot.docs.map((doc: any) => ({
                id: doc.id,
                data: doc.data(),
              }))
            : [],
        ),
      );

    return () => {
      if (unsubscribeSnapshotListener) {
        unsubscribeSnapshotListener();
      }
    };
  }, [selectedOrganization, db]);

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
            api={api(config)}
            organization={selectedOrganization}
          />
        }
      />
      <Route
        path="/ny"
        element={
          <Register
            lines={lines}
            api={api(config)}
            organization={selectedOrganization}
          />
        }
      />
    </Routes>
  );
};
