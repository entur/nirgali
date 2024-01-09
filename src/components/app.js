import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { TabPanel, TabPanels } from '@entur/tab';
import { TabsContainer } from './tabs-container';
import { Messages } from './messages/messages';
import { Cancellations } from './cancellations/cancellations';
import { ExtraJourneys } from './extrajourneys/extra-journeys';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';

export const App = ({ selectedOrganization }) => {
  const config = useConfig();

  const [lines, setLines] = useState();

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

  return (
    <Router>
      <div>
        <div className="register_box">
          <Routes>
            <Route path="/" element={<Navigate to="/meldinger" />} />
            <Route
              path="/:tab/*"
              element={
                <TabsContainer>
                  {(selectedTab) => (
                    <TabPanels>
                      <TabPanel>
                        {selectedTab === 0 && (
                          <Messages
                            selectedOrganization={selectedOrganization}
                            lines={lines}
                            api={api(config)}
                          />
                        )}
                      </TabPanel>

                      <TabPanel>
                        {selectedTab === 1 && (
                          <Cancellations
                            selectedOrganization={selectedOrganization}
                            lines={lines}
                            api={api(config)}
                          />
                        )}
                      </TabPanel>

                      <TabPanel>
                        {selectedTab === 2 && <ExtraJourneys />}
                      </TabPanel>
                    </TabPanels>
                  )}
                </TabsContainer>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};
