import { Contrast } from '@entur/layout';
import { Tabs, TabList, Tab } from '@entur/tab';
import { useNavigate, useParams } from 'react-router-dom';

const tabsMap = {
  meldinger: 0,
  kanselleringer: 1,
};

export const TabsContainer = ({ children }) => {
  const { tab } = useParams();
  const navigate = useNavigate();

  return (
    <Tabs
      value={tabsMap[tab]}
      onChange={(newIndex) => navigate('/' + Object.keys(tabsMap)[newIndex])}
    >
      <Contrast>
        <TabList style={{ marginBottom: '1rem' }}>
          <Tab>Avviksmeldinger</Tab>
          <Tab>Kanselleringer</Tab>
        </TabList>
      </Contrast>
      {children(tabsMap[tab])}
    </Tabs>
  );
};
