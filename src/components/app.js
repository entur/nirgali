import React from 'react';
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

export const App = ({ selectedOrganization }) => {
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
                          />
                        )}
                      </TabPanel>

                      <TabPanel>
                        {selectedTab === 1 && (
                          <Cancellations
                            selectedOrganization={selectedOrganization}
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
