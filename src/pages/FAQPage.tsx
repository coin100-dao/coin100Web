import React from 'react';
import { Box } from '@mui/material';
import FAQ from '../components/faq/FAQ';

const FAQPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, rgba(255,111,97,0.1) 0%, rgba(100,181,246,0.1) 100%)',
        pt: 8,
        pb: 12,
      }}
    >
      <FAQ />
    </Box>
  );
};

export default FAQPage;
