import { useCallback, ReactNode } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
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
    <>
      <Paper
        square
        elevation={1}
        sx={{
          position: 'sticky',
          top: 64,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            {permissions.includes('MESSAGES') && (
              <Tab label="Avviksmeldinger" />
            )}
            {permissions.includes('CANCELLATIONS') && (
              <Tab label="Kanselleringer" />
            )}
            {permissions.includes('EXTRAJOURNEYS') && (
              <Tab label="Ekstraavganger" />
            )}
          </Tabs>
        </Container>
      </Paper>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children(currentTab)}
      </Container>
    </>
  );
};
