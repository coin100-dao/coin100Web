// src/components/home/Features.tsx

import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SecurityIcon from '@mui/icons-material/Security';
import BalanceIcon from '@mui/icons-material/Balance';
import UpdateIcon from '@mui/icons-material/Update';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const StyledPaper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

const FeatureIcon = styled(Box)(({ theme }: { theme: Theme }) => ({
  width: '64px',
  height: '64px',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '& svg': {
    fontSize: '32px',
    color: theme.palette.common.white,
  },
}));

const features = [
  {
    icon: <AccountBalanceWalletIcon />,
    title: 'Easy Investment',
    description:
      'Gain exposure to the top 100 cryptocurrencies with a single, easily manageable token.',
  },
  {
    icon: <AutoGraphIcon />,
    title: 'Automated Rebase',
    description:
      'Automatically adjusts your balance to reflect changes in the top 100 market cap, ensuring your investment stays aligned with the market.',
  },
  {
    icon: <SecurityIcon />,
    title: 'Secure & Audited',
    description:
      'Built with robust security measures and audited by multiple independent firms to ensure the safety of your investments.',
  },
  {
    icon: <BalanceIcon />,
    title: 'Fair Distribution',
    description:
      'Equal treatment of all holders during rebases and updates, maintaining proportional ownership without favoritism.',
  },
  {
    icon: <UpdateIcon />,
    title: 'Regular Updates',
    description:
      'Frequent rebasing mechanisms keep the index current with real-time market cap changes, providing up-to-date exposure.',
  },
  {
    icon: <AccountTreeIcon />,
    title: 'Polygon Network',
    description:
      'Leveraging Polygon for low fees, high transaction throughput, and seamless integration with DeFi protocols.',
  },
];

const Features = () => {
  return (
    <Box
      sx={{ py: 10, background: (theme) => theme.palette.background.default }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: (theme) =>
                `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Key Features
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto' }}
          >
            Discover why COIN100 is the future of crypto index investing
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid key={index} item xs={12} sm={6} md={4}>
              <StyledPaper>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  {feature.description}
                </Typography>
              </StyledPaper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
