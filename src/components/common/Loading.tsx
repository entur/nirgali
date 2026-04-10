import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingProps {
  isLoading?: boolean;
  text?: string;
  children: ReactElement | null;
}

const Loading = ({ isLoading = true, text, children }: LoadingProps) => {
  if (!isLoading) {
    return children;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        color: 'primary.main',
      }}
    >
      <CircularProgress color="inherit" />
      {text && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
