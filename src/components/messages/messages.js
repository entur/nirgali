import { Routes, Route } from 'react-router-dom';
import Overview from './overview';
import Register from './register';
import Edit from './edit';
import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import api from '../../api/api';
import { useConfig } from '../../config/ConfigContext';

export const Messages = ({ selectedOrganization }) => {
  const [messages, setMessages] = useState([]);
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
            api={api(config)}
            organization={selectedOrganization}
          />
        }
      />
      <Route
        path="/ny"
        element={
          <Register
            api={api(config)}
            firebase={db}
            lines={lines}
            organization={selectedOrganization}
          />
        }
      />
    </Routes>
  );
};
