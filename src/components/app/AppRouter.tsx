import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { TabsContainer } from './TabsContainer';
import { Messages } from '../messages/Messages';
import { Cancellations } from '../cancellations/Cancellations';
import { ExtraJourneys } from '../extrajourneys/ExtraJourneys';
import { Codespace } from '../../reducers/organizationsSlice';

interface AppRouterProps {
  allowedCodespaces: Codespace[];
  isAdmin: boolean;
  selectedOrganization: string;
}

export const AppRouter = ({
  allowedCodespaces,
  isAdmin,
  selectedOrganization,
}: AppRouterProps) => {
  let permissions: string[];

  if (isAdmin) {
    permissions = ['MESSAGES', 'CANCELLATIONS', 'EXTRAJOURNEYS'];
  } else {
    const codespace = allowedCodespaces.find(
      (cs) => cs.id === selectedOrganization.split(':')[0],
    );
    permissions = codespace?.permissions ?? [];
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/meldinger" />} />
        <Route
          path="/:tab/*"
          element={
            <TabsContainer permissions={permissions}>
              {(selectedTab: number) => (
                <>
                  {selectedTab === 0 && (
                    <Messages selectedOrganization={selectedOrganization} />
                  )}
                  {selectedTab === 1 && (
                    <Cancellations
                      selectedOrganization={selectedOrganization}
                    />
                  )}
                  {selectedTab === 2 && (
                    <ExtraJourneys
                      selectedOrganization={selectedOrganization}
                    />
                  )}
                </>
              )}
            </TabsContainer>
          }
        />
      </Routes>
    </Router>
  );
};
