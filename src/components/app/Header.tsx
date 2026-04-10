import { useCallback, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import { SelectChangeEvent } from '@mui/material/Select';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../img/entur_logo.jpg';

interface HeaderProps {
  organizations: { id: string; name: string }[];
  selectedOrganization: string | undefined;
  onSelectOrganization: (id: string) => void;
  onLogout: () => void;
}

export const Header = ({
  organizations,
  selectedOrganization,
  onSelectOrganization,
  onLogout,
}: HeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      onSelectOrganization(event.target.value);
    },
    [onSelectOrganization],
  );

  const selectedOrgName = organizations.find(
    (org) => org.id === selectedOrganization,
  )?.name;

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="a"
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Entur"
            sx={{ width: 100, height: 'auto' }}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        {organizations.length > 0 && (
          <Select
            value={selectedOrganization ?? ''}
            onChange={handleChange}
            size="small"
            displayEmpty
            sx={{
              minWidth: 250,
              color: 'primary.contrastText',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.contrastText',
              },
              '.MuiSvgIcon-root': { color: 'primary.contrastText' },
            }}
          >
            {organizations.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name}
              </MenuItem>
            ))}
          </Select>
        )}

        <IconButton
          color="inherit"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Brukermeny"
        >
          <AccountCircle />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 200 } } }}
        >
          {selectedOrgName && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Organisasjon
              </Typography>
              <Typography variant="body2">{selectedOrgName}</Typography>
            </Box>
          )}
          {selectedOrgName && <Divider />}
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onLogout();
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logg ut</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
