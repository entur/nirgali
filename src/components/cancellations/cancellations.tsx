import { Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';

export const Cancellations = ({ selectedOrganization }: any) => {
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
  }, [selectedOrganization]);
  return (
    <Routes>
      <Route
        path="/"
        element={<h1 style={{ color: 'white' }}>Hello world</h1>}
      />
    </Routes>
  );
};
