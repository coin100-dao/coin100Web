import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTopCoins } from '../store/slices/coingeckoSlice';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
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
import darkLogo from '../assets/c100-high-resolution-dark-logo-transparent.svg';
import lightLogo from '../assets/c100-high-resolution-light-logo-transparent.svg';

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

const HeroSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(8),
  padding: theme.spacing(8, 0),
  background:
    'linear-gradient(45deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 203, 243, 0.1) 100%)',
  borderRadius: '20px',
}));

const ProblemCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: theme.spacing(6),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(4),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '4px',
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    borderRadius: '2px',
  },
}));

const Home = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const logo = theme.palette.mode === 'light' ? lightLogo : darkLogo;

  useEffect(() => {
    dispatch(fetchTopCoins());
  }, [dispatch]);

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
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <img
              src={logo}
              alt="COIN100 Logo"
              style={{
                height: '80px',
                marginBottom: '2rem',
                filter:
                  theme.palette.mode === 'dark'
                    ? 'brightness(1)'
                    : 'brightness(0.9)',
              }}
            />
          </Box>
          <Typography variant="h2" component="h1" gutterBottom>
            COIN100 (C100)
          </Typography>
          <GradientText variant="h4" gutterBottom>
            The Future of Crypto Index Funds
          </GradientText>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
            Your Gateway to the Top 100 Cryptocurrencies
          </Typography>
        </HeroSection>

        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h3" align="center" gutterBottom>
            The Challenge
          </SectionTitle>
          <ProblemCard>
            <Typography variant="body1" paragraph>
              The cryptocurrency market is renowned for its volatility and rapid
              growth. However, navigating this landscape can be challenging for
              both new and seasoned investors. Traditional financial instruments
              like index funds have provided a balanced and diversified
              investment approach in conventional markets.
            </Typography>
            <Typography
              variant="h6"
              color="primary"
              gutterBottom
              sx={{ mt: 3 }}
            >
              Key Challenges:
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="body1">
                  • High volatility and risk exposure with individual
                  cryptocurrencies
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1">
                  • Time-consuming portfolio management and tracking
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1">
                  • Limited access to regulated index-based investments
                </Typography>
              </Grid>
            </Grid>
          </ProblemCard>
        </Box>

        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h3" align="center" gutterBottom>
            Our Solution
          </SectionTitle>
          <ProblemCard>
            <Typography variant="body1" paragraph>
              COIN100 (C100) addresses these challenges by offering a
              decentralized index fund that tracks the top 100 cryptocurrencies
              by market capitalization. By holding C100 tokens, investors gain
              diversified exposure to the leading cryptocurrencies, mitigating
              the risks associated with individual asset volatility.
            </Typography>
            <Typography variant="body1">
              Built on the Polygon network, C100 ensures low transaction fees,
              high scalability, and robust security, making it the perfect
              solution for both newcomers and experienced crypto investors.
            </Typography>
          </ProblemCard>
        </Box>

        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h3" align="center" gutterBottom>
            Core Features
          </SectionTitle>
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
        </Box>

        <Box sx={{ mb: 8 }}>
          <SectionTitle variant="h3" align="center" gutterBottom>
            How It Works
          </SectionTitle>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <ProblemCard>
                <Typography variant="h6" color="primary" gutterBottom>
                  Dynamic Rebase Mechanism
                </Typography>
                <Typography variant="body1" paragraph>
                  The C100 token incorporates a dynamic rebase mechanism that
                  adjusts the token supply based on the total market
                  capitalization. This ensures that the token remains a true
                  reflection of the underlying index, maintaining its relevance
                  and accuracy in tracking market movements.
                </Typography>
              </ProblemCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ProblemCard>
                <Typography variant="h6" color="primary" gutterBottom>
                  Automated Rewards System
                </Typography>
                <Typography variant="body1" paragraph>
                  C100 holders are rewarded through an automated distribution
                  system. The reward rate adjusts based on the token&apos;s
                  price, ensuring sustainability and alignment with market
                  conditions. Join our liquidity pools today and earn rewards
                  ranging from 10% to 1,042.8% APY!
                </Typography>
              </ProblemCard>
            </Grid>
          </Grid>
        </Box>
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
