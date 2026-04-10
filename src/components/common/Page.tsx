import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBack from '@mui/icons-material/ArrowBack';

interface PageProps {
  title?: string;
  backButtonTitle: string;
  onBackButtonClick?: () => void;
  children: ReactNode;
}

const Page = ({
  title,
  backButtonTitle,
  onBackButtonClick,
  children,
}: PageProps) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Button
        variant="text"
        startIcon={<ArrowBack />}
        onClick={() => (onBackButtonClick ? onBackButtonClick() : navigate(-1))}
        sx={{ mb: 2 }}
      >
        {backButtonTitle}
      </Button>
      <Box sx={{ mx: { xs: 0, md: 6 }, my: 3 }}>
        {title && (
          <Typography variant="h4" sx={{ mb: 3 }}>
            {title}
          </Typography>
        )}
        {children}
      </Box>
    </Box>
  );
};

export default Page;
