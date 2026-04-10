import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface OverlayLoaderProps {
  isLoading: boolean;
  text?: string;
  children: ReactElement | ReactElement[];
}

const OverlayLoader = ({ isLoading, text, children }: OverlayLoaderProps) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {isLoading && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'background.default',
              opacity: 0.9,
              zIndex: 1001,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1002,
            }}
          >
            <CircularProgress />
            {text && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                {text}
              </Typography>
            )}
          </Box>
        </>
      )}
      {children}
    </Box>
  );
};

export default OverlayLoader;
