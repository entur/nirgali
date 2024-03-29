import { Contrast } from '@entur/layout';
import { Tabs, TabList, Tab } from '@entur/tab';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@entur/auth-provider';
import { hasExtraJourneysAccess } from '../../util/roleUtils';

const tabsMap = {
  meldinger: 0,
  kanselleringer: 1,
  ekstraavganger: 2,
};

export const TabsContainer = ({ children, selectedOrganization }) => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const onTabChange = useCallback(
    (newIndex) => navigate('/' + Object.keys(tabsMap)[newIndex]),
    [navigate],
  );

  const auth = useAuth();

  const showExtraJourneysTab = hasExtraJourneysAccess(
    auth,
    selectedOrganization,
  );

  return (
    <Tabs index={tabsMap[tab]} onChange={onTabChange}>
      <Contrast>
        <TabList style={{ marginBottom: '1rem' }}>
          <Tab>Avviksmeldinger</Tab>
          <Tab>Kanselleringer</Tab>
          {showExtraJourneysTab && <Tab>Ekstraavganger</Tab>}
        </TabList>
      </Contrast>
      {children(tabsMap[tab])}
    </Tabs>
  );
};
