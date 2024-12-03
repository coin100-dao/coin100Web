import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopCoins } from '../store/slices/coingeckoSlice';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import GroupsIcon from '@mui/icons-material/Groups';
import BalanceIcon from '@mui/icons-material/Balance';
import SpeedIcon from '@mui/icons-material/Speed';
import UpdateIcon from '@mui/icons-material/Update';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TwitterIcon from '@mui/icons-material/Twitter';
import RedditIcon from '@mui/icons-material/Reddit';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  '& svg': {
    fontSize: '30px',
    color: 'white',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(4),
}));

const StyledFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  background: 'rgba(33, 150, 243, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '10px',
  border: '1px solid rgba(33, 150, 243, 0.2)',
}));

const HeroSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(8),
  padding: theme.spacing(8, 0),
  background:
    'linear-gradient(45deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 203, 243, 0.1) 100%)',
  borderRadius: '20px',
}));

const Home = () => {
  const dispatch = useDispatch();
  const { totalMarketCap, loading } = useSelector((state) => state.coingecko);

  useEffect(() => {
    dispatch(fetchTopCoins());
  }, [dispatch]);

  const formatMarketCap = (value) => {
    if (!value) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const features = [
    {
      title: 'Decentralized Index Fund',
      icon: <AccountBalanceWalletIcon />,
      description:
        'Track the top 100 cryptocurrencies through a single token, offering unparalleled diversification and market exposure.',
    },
    {
      title: 'Dynamic Rebase Mechanism',
      icon: <AutoGraphIcon />,
      description:
        'Automatic supply adjustments ensure accurate market cap tracking and sustainable token economics.',
    },
    {
      title: 'High APY Rewards',
      icon: <TrendingUpIcon />,
      description:
        'Earn substantial rewards through our innovative reward distribution system. Potential APY ranges from 10% to 1,042.8%, depending on the total liquidity provided. Join our liquidity pools today and maximize your earnings!',
    },
    {
      title: 'Advanced Security',
      icon: <SecurityIcon />,
      description:
        'Built with robust security features including pausability and protection against common attack vectors.',
    },
    {
      title: 'Community Governance',
      icon: <HowToVoteIcon />,
      description:
        'Shape the future of COIN100 through our democratic voting system and proposal mechanism.',
    },
    {
      title: 'Market Analytics',
      icon: <SpeedIcon />,
      description:
        'Real-time market data and performance metrics to track your investment growth.',
    },
    {
      title: 'Automated Portfolio',
      icon: <UpdateIcon />,
      description:
        'Smart contracts automatically maintain optimal market representation without manual intervention.',
    },
    {
      title: 'Polygon Network',
      icon: <AccountTreeIcon />,
      description:
        'Built on Polygon for lightning-fast transactions and minimal gas fees.',
    },
    {
      title: 'Community Driven',
      icon: <GroupsIcon />,
      description:
        'Strong community focus with regular events, updates, and engagement opportunities.',
    },
    {
      title: 'Fair Distribution',
      icon: <BalanceIcon />,
      description:
        'Transparent token distribution ensuring long-term sustainability and fair participation.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ py: 8, flex: 1 }}>
        <HeroSection>
          <Typography variant="h2" component="h1" gutterBottom>
            COIN100 (C100)
          </Typography>
          <GradientText variant="h4" gutterBottom>
            The Future of Crypto Index Funds
          </GradientText>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
            Your Gateway to the Top 100 Cryptocurrencies
          </Typography>

          <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <StatsCard>
                <Typography variant="h6">Total Market Cap</Typography>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    formatMarketCap(totalMarketCap)
                  )}
                </Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard>
                <Typography variant="h6">Current APY</Typography>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  Up to 365,000%
                </Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard>
                <Typography variant="h6">Token Price Target</Typography>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  $0.01
                </Typography>
              </StatsCard>
            </Grid>
          </Grid>
        </HeroSection>

        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 6, textAlign: 'center' }}
        >
          Why Choose COIN100?
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StyledPaper>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="textSecondary">
                  {feature.description}
                </Typography>
              </StyledPaper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <StyledFooter>
        <Container maxWidth="lg">
          <Grid
            container
            spacing={3}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton
                  href="https://x.com/Coin100token"
                  target="_blank"
                  color="primary"
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  href="https://discord.com/channels/1312498183485784236/1312498184500674693"
                  target="_blank"
                  color="primary"
                >
                  <ChatIcon />
                </IconButton>
                <IconButton
                  href="https://www.reddit.com/r/Coin100"
                  target="_blank"
                  color="primary"
                >
                  <RedditIcon />
                </IconButton>
                <IconButton href="mailto:support@coin100.link" color="primary">
                  <EmailIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                &copy; 2024 COIN100. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="textSecondary">
                Contract: 0xdbe819ddf0d14a54ffe611c6d070b32a7f9d23d1
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </StyledFooter>
    </Box>
  );
};

export default Home;
