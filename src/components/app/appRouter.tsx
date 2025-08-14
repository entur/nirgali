import React from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { TabPanel, TabPanels } from '@entur/tab';
import { TabsContainer } from './tabs-container';
import { Messages } from '../messages/messages';
import { Cancellations } from '../cancellations/cancellations';
import { ExtraJourneys } from '../extrajourneys/extra-journeys';
import { useSelectedOrganization } from '../../hooks/useSelectedOrganization';

export const AppRouter = ({
  allowedCodespaces,
}: {
  allowedCodespaces: any[];
}) => {
  const selectedOrganization = useSelectedOrganization();
  const permissions = allowedCodespaces.find(
    (codespace) =>
      codespace.id === '*' ||
      codespace.id === selectedOrganization.split(':')[0],
  ).permissions;

  return (
    <Router>
      <div>
        <div className="register_box">
          <Routes>
            <Route path="/" element={<Navigate to="/meldinger" />} />
            <Route
              path="/:tab/*"
              element={
                <TabsContainer permissions={permissions}>
                  {(selectedTab: number) => (
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
