import { useCallback, ReactNode } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useNavigate, useParams } from 'react-router-dom';

const tabsMap: Record<string, number> = {
  meldinger: 0,
  kanselleringer: 1,
  ekstraavganger: 2,
};

const tabKeys = Object.keys(tabsMap);

interface TabsContainerProps {
  permissions: string[];
  children: (selectedTab: number) => ReactNode;
}

export const TabsContainer = ({
  children,
  permissions,
}: TabsContainerProps) => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  const currentTab = tab ? (tabsMap[tab] ?? 0) : 0;

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      navigate('/' + tabKeys[newValue]);
    },
    [navigate],
  );

  return (
    <Box>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          '& .MuiTab-root': { color: 'text.secondary' },
          '& .Mui-selected': { color: 'primary.main' },
        }}
      >
        {permissions.includes('MESSAGES') && <Tab label="Avviksmeldinger" />}
        {permissions.includes('CANCELLATIONS') && (
          <Tab label="Kanselleringer" />
        )}
        {permissions.includes('EXTRAJOURNEYS') && (
          <Tab label="Ekstraavganger" />
        )}
      </Tabs>
      {children(currentTab)}
    </Box>
  );
};
