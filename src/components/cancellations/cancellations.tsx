import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import Overview from './overview';
import { Register } from './register';
import Edit from './edit';
import { useConfig } from '../../config/ConfigContext';
import api from '../../api/api';

export const Cancellations = ({ selectedOrganization }: any) => {
  const [cancellations, setCancellations] = useState([]);
  const [lines, setLines] = useState();
  const config = useConfig();

  const db = firebase.firestore();

  useEffect(() => {
    const getLines = async () => {
      const response = await api(config).getLines(selectedOrganization);
      if (response.data) {
        setLines(response.data.lines);
      } else {
        console.log('Could not find any lines for this organization');
      }
    };
    getLines();
  }, [selectedOrganization, config]);

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
