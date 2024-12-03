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
} from '@mui/material';
import { styled } from '@mui/system';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PoolIcon from '@mui/icons-material/Pool';

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
      title: 'Decentralized Governance',
      icon: <HowToVoteIcon />,
      description:
        "Participate in shaping COIN100's future through our democratic voting system. Token holders can propose and vote on important protocol decisions, ensuring true decentralization.",
    },
    {
      title: 'Smart Rewards System',
      icon: <LocalAtmIcon />,
      description:
        'Earn rewards through multiple streams including holding, providing liquidity, and participating in governance. Our dynamic reward system adjusts based on market conditions.',
    },
    {
      title: 'Liquidity Mining',
      icon: <PoolIcon />,
      description:
        'Provide liquidity to earn additional rewards. Our liquidity pools offer competitive APY and bonus incentives for long-term liquidity providers.',
    },
    {
      title: 'Portfolio Management',
      icon: <AccountBalanceWalletIcon />,
      description:
        'Get exposure to the top 100 cryptocurrencies through a single token. Our smart contract automatically rebalances to maintain optimal market representation.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <GradientText variant="h2" component="h1" gutterBottom>
          COIN100 (C100)
        </GradientText>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          The Future of Crypto Index Investing
        </Typography>

        {/* Market Cap Display */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mt: 4,
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Total Market Cap Tracked
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 'bold' }}
            >
              {formatMarketCap(totalMarketCap)}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StyledPaper>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {feature.description}
              </Typography>
            </StyledPaper>
          </Grid>
        ))}
      </Grid>

      {/* Additional Information */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Why Choose COIN100?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Governance Mechanism
              </Typography>
              <Typography paragraph>
                Our governance system empowers token holders to actively
                participate in the protocol development. Each C100 token
                represents one vote, ensuring fair representation. Proposals can
                range from technical upgrades to strategic partnerships.
              </Typography>
              <Typography paragraph>
                Key features include: • 3-day voting periods • Minimum token
                holding requirement for proposals • Transparent execution of
                approved changes
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Rewards Ecosystem
              </Typography>
              <Typography paragraph>
                COIN100 features a multi-layered reward system designed to
                benefit all participants: • Holding Rewards: Earn from
                transaction fees • Liquidity Provider Rewards: Up to 25% APY •
                Governance Participation Rewards
              </Typography>
              <Typography>
                Our smart contracts automatically distribute rewards, ensuring
                fairness and transparency.
              </Typography>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
