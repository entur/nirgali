import { Routes, Route } from 'react-router-dom';
import Overview from './overview';
import Register from './register';
import Edit from './edit';

export const Messages = ({ messages, selectedOrganization, lines, api, db}: any) => {

  return (
<Routes>
                    <Route
                      path="/meldinger"
                      element={<Overview messages={messages} />}
                    />
                    <Route
                      path="/meldinger/:id"
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
                      path="/meldinger/ny"
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
}