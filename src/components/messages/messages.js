import { Routes, Route } from 'react-router-dom';
import Overview from './overview';
import Register from './register';
import Edit from './edit';
import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';

export const Messages = ({ selectedOrganization, lines, api }) => {
  const [messages, setMessages] = useState([]);
  const db = firebase.firestore();
  useEffect(() => {
    const codespace = selectedOrganization.split(':')[0];
    const authority = selectedOrganization;

    if (!codespace || !authority) {
      return;
    }

    const unsubscribeSnapshotListener = db
      .collection(`codespaces/${codespace}/authorities/${authority}/messages`)
      .onSnapshot((querySnapshot) =>
        setMessages(
          querySnapshot.size > 0
            ? querySnapshot.docs.map((doc) => ({
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
      <Route path="/" element={<Overview messages={messages} />} />
      <Route
        path="/:id"
        element={
          <Edit
            messages={messages}
            lines={lines}
            firebase={db}
            api={api}
            organization={selectedOrganization}
          />
        }
      />
      <Route
        path="/ny"
        element={
          <Register
            api={api}
            firebase={db}
            lines={lines}
            organization={selectedOrganization}
          />
        }
      />
    </Routes>
  );
};
