import React from 'react';
import { Box, useTheme } from '@mui/material';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Tokenomics from '../components/home/Tokenomics';
import TechnicalArchitecture from '../components/home/TechnicalArchitecture';
import Governance from '../components/home/Governance';
import Roadmap from '../components/home/Roadmap';
import ICO from '../components/home/ICO';

const Home = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,111,97,0.1) 0%, rgba(0,0,0,0) 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Hero />

        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(255,111,97,0.05) 100%)',
              pointerEvents: 'none',
            }}
          />
          <Features />
        </Box>

        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background:
                'linear-gradient(180deg, rgba(255,111,97,0.05) 0%, rgba(0,0,0,0) 100%)',
              pointerEvents: 'none',
            }}
          />
          <Tokenomics />
        </Box>

        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(255,111,97,0.05) 100%)',
              pointerEvents: 'none',
            }}
          />
          <TechnicalArchitecture />
        </Box>

        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background:
                'linear-gradient(180deg, rgba(255,111,97,0.05) 0%, rgba(0,0,0,0) 100%)',
              pointerEvents: 'none',
            }}
          />
          <Governance />
        </Box>

        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(255,111,97,0.05) 100%)',
              pointerEvents: 'none',
            }}
          />
          <ICO />
        </Box>

        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background:
                'linear-gradient(180deg, rgba(255,111,97,0.05) 0%, rgba(0,0,0,0) 100%)',
              pointerEvents: 'none',
            }}
          />
          <Roadmap />
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
