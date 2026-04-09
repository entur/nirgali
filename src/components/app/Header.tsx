import { useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
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
  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      onSelectOrganization(event.target.value);
    },
    [onSelectOrganization],
  );

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="a"
          href="/"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
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

        <Button
          color="inherit"
          onClick={onLogout}
          startIcon={<LogoutIcon />}
          sx={{ ml: 1 }}
        >
          <Typography variant="body2">Logg ut</Typography>
        </Button>
      </Toolbar>
    </AppBar>
  );
};
