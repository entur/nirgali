import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import Overview from './overview';
import { Register } from './register';

export const Cancellations = ({ selectedOrganization, lines, api }: any) => {
  const [cancellations, setCancellations] = useState([]);
  const db = firebase.firestore();
  useEffect(() => {
    const codespace = selectedOrganization.split(':')[0];
    const authority = selectedOrganization;

    if (!codespace || !authority) {
      return;
    }

    const unsubscribeSnapshotListener = db
      .collection(
        `codespaces/${codespace}/authorities/${authority}/cancellations`
      )
      .onSnapshot((querySnapshot: any) =>
        setCancellations(
          querySnapshot.size > 0
            ? querySnapshot.docs.map((doc: any) => ({
                id: doc.id,
                data: doc.data(),
              }))
            : []
        )
      );

    return () => {
      if (unsubscribeSnapshotListener) {
        unsubscribeSnapshotListener();
      }
    };
  }, [selectedOrganization, db]);
  return (
    <Routes>
      <Route path="/" element={<Overview cancellations={cancellations} />} />
      <Route
        path="/ny"
        element={
          <Register
            lines={lines}
            api={api}
            organization={selectedOrganization}
          />
        }
      />
    </Routes>
  );
};
