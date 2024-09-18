import { Contrast } from '@entur/layout';
import { Tabs, TabList, Tab } from '@entur/tab';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const tabsMap = {
  meldinger: 0,
  kanselleringer: 1,
  ekstraavganger: 2,
};

export const TabsContainer = ({ children, permissions }) => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const onTabChange = useCallback(
    (newIndex) => navigate('/' + Object.keys(tabsMap)[newIndex]),
    [navigate],
  );

  return (
    <Tabs index={tabsMap[tab]} onChange={onTabChange}>
      <Contrast>
        <TabList style={{ marginBottom: '1rem' }}>
          {permissions.includes('MESSAGES') && <Tab>Avviksmeldinger</Tab>}
          {permissions.includes('CANCELLATIONS') && <Tab>Kanselleringer</Tab>}
          {permissions.includes('EXTRAJOURNEYS') && <Tab>Ekstraavganger</Tab>}
        </TabList>
      </Contrast>
      {children(tabsMap[tab])}
    </Tabs>
  );
};
