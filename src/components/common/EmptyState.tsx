import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  message: string;
  icon?: ReactElement;
}

const EmptyState = ({ message, icon }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        color: 'text.secondary',
      }}
    >
      {icon ?? <InboxIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />}
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
};

export default EmptyState;
