import React from 'react';
import { Box, useTheme } from '@mui/material';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Tokenomics from '../components/home/Tokenomics';
import TechnicalArchitecture from '../components/home/TechnicalArchitecture';
import Governance from '../components/home/Governance';
import Roadmap from '../components/home/Roadmap';

const Home = () => {
  const theme = useTheme();

  return (
    <Box
      component="main"
      role="main"
      aria-label="COIN100 - Decentralized Crypto Index Fund"
      sx={{
        background: theme.palette.background.default,
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      <Box
        component="div"
        aria-hidden="true"
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
        component="div"
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <section aria-labelledby="hero-title">
          <Hero />
        </section>

        <section aria-labelledby="features-title" id="features">
          <Box
            component="div"
            aria-hidden="true"
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
        </section>

        <section aria-labelledby="tokenomics-title" id="tokenomics">
          <Box
            component="div"
            aria-hidden="true"
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
        </section>

        <section aria-labelledby="technical-title" id="technical">
          <Box
            component="div"
            aria-hidden="true"
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
        </section>

        <section aria-labelledby="governance-title" id="governance">
          <Box
            component="div"
            aria-hidden="true"
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
        </section>

        <section aria-labelledby="roadmap-title" id="roadmap">
          <Box
            component="div"
            aria-hidden="true"
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
        </section>
      </Box>
    </Box>
  );
};

export default Home;
