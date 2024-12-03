import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/system';
import {
  AutoGraph as IndexIcon,
  Autorenew as RebaseIcon,
  CardGiftcard as RewardsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  background:
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.02)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  transition: 'all 0.3s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-8px)',
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.04)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  '& svg': {
    fontSize: '40px',
    color: theme.palette.primary.contrastText,
  },
}));

const features = [
  {
    icon: <IndexIcon />,
    title: 'Decentralized Index Fund',
    description:
      'Track the top 100 cryptocurrencies by market cap through a single token, offering unparalleled diversification.',
  },
  {
    icon: <RebaseIcon />,
    title: 'Dynamic Rebase Mechanism',
    description:
      'Automatic supply adjustments ensure accurate tracking of the underlying index.',
  },
  {
    icon: <RewardsIcon />,
    title: 'Automated Rewards',
    description:
      'Earn rewards through automated distribution, incentivizing long-term holding.',
  },
  {
    icon: <SecurityIcon />,
    title: 'Governance & Security',
    description:
      'Robust governance mechanisms and advanced security features protect your investment.',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <Box sx={{ py: 12, px: 4, position: 'relative' }}>
      <Typography variant="h3" align="center" gutterBottom>
        Key Features
      </Typography>
      <Typography
        variant="h6"
        align="center"
        sx={{ mb: 8, color: 'text.secondary' }}
      >
        Why COIN100 is the future of crypto investing
      </Typography>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <FeatureCard>
              <IconWrapper>{feature.icon}</IconWrapper>
              <Typography variant="h5" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {feature.description}
              </Typography>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturesSection;
