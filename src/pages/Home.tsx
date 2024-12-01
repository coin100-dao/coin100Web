// src/pages/Home.tsx

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  useTheme,
  Card,
  CardContent,
  Fade,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Diversity1 as DiversifyIcon,
  EmojiEvents as EmojiEventsIcon,
  Gavel as GavelIcon,
  Sync as SyncIcon,
  People as PeopleIcon,
  EmojiNature as EcoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { connectWallet } from '../store/slices/web3Slice';
import { useNavigate } from 'react-router-dom';

// Import light and dark SVG logos
import CoinLogoLight from '../assets/c100-high-resolution-light-logo.svg';
import CoinLogoDark from '../assets/c100-high-resolution-dark-logo.svg';

// Styled component for feature boxes with modern hover effects and equal height
const FeatureBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  color: theme.palette.text.primary,
  borderRadius: theme.spacing(2),
  background: theme.palette.background.paper,
  transition: 'transform 0.3s, box-shadow 0.3s, background 0.3s',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '350px',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)', // Enhanced shadow on hover
    background: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const Home: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { walletAddress, loading } = useAppSelector((state) => state.web3);

  const handleBuyToken = () => {
    dispatch(connectWallet());
    // Navigate to dashboard after connecting wallet
    navigate('/dashboard');
  };

  // Determine the appropriate logo based on the current theme mode
  const logo = theme.palette.mode === 'light' ? CoinLogoLight : CoinLogoDark;

  const features = [
    {
      icon: <TrendingUpIcon color="primary" sx={{ fontSize: 60 }} />,
      title: 'Dynamic Rebase Mechanism 🚀',
      description:
        'Adjusts token supply based on market cap to maintain price stability and accurate index tracking.',
    },
    {
      icon: <SecurityIcon color="secondary" sx={{ fontSize: 60 }} />,
      title: 'Robust Security 🔒',
      description:
        'Top-tier security measures, including pausability and reentrancy protection, to safeguard your investments.',
    },
    {
      icon: <DiversifyIcon color="primary" sx={{ fontSize: 60 }} />,
      title: 'Diversified Portfolio 📊',
      description:
        'Exposure to the top 100 cryptocurrencies, minimizing risks associated with individual assets.',
    },
    {
      icon: <EmojiEventsIcon color="secondary" sx={{ fontSize: 60 }} />,
      title: 'Rewarding Holders 🏆',
      description:
        'Earn rewards through transaction fees and incentives for liquidity providers and upkeep users.',
    },
    {
      icon: <GavelIcon color="primary" sx={{ fontSize: 60 }} />,
      title: 'Decentralized Governance 🗳️',
      description:
        'Community-driven voting on key decisions, ensuring transparent and fair project evolution.',
    },
    {
      icon: <EcoIcon color="secondary" sx={{ fontSize: 60 }} />,
      title: 'Eco-Friendly on Polygon 🌱',
      description:
        'Low fees and high scalability with minimal environmental impact, promoting sustainable growth.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: '#fff',
          py: 14,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Coin Logo as Background Element */}
        <Box
          component="img"
          src={logo}
          alt="COIN100 Logo"
          sx={{
            width: 300,
            height: 300,
            position: 'absolute',
            top: -100,
            right: -100,
            opacity: 0.1,
            zIndex: 1,
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Logo Next to Heading */}
          <Box
            component="img"
            src={logo}
            alt="COIN100 Logo"
            sx={{
              width: 100,
              height: 100,
              margin: '0 auto',
              mb: 4,
            }}
          />
          <Fade in timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-1px',
                  textTransform: 'uppercase',
                }}
              >
                Welcome to <strong>COIN100</strong>
              </Typography>
              <Typography variant="h5" sx={{ mb: 6 }}>
                Your Gateway to a Diversified Crypto Portfolio on Polygon
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleBuyToken}
                startIcon={
                  <Box
                    component="img"
                    src={logo}
                    alt="COIN100 Logo"
                    sx={{ width: 24, height: 24 }}
                  />
                }
                sx={{
                  borderRadius: 50,
                  px: 5,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: theme.shadows[4],
                  transition: 'box-shadow 0.3s, transform 0.3s',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {loading
                  ? 'Connecting...'
                  : walletAddress
                    ? 'Go to Dashboard'
                    : 'Buy Token'}
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* What is COIN100 Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          What is <strong>COIN100</strong>?
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          paragraph
          sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}
        >
          COIN100 (C100) is a decentralized cryptocurrency index fund built on
          the Polygon network. It represents the top 100 cryptocurrencies by
          market capitalization, offering users a diversified portfolio that
          mirrors the performance of the overall crypto market. Inspired by
          traditional index funds like the S&P 500, our ultimate goal is to
          dynamically track and reflect the top 100 cryptocurrencies, ensuring
          COIN100 remains a relevant and accurate representation of the
          cryptocurrency market.
        </Typography>
        <Divider sx={{ my: 6 }} />
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <SecurityIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Decentralized & Community-Driven
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Governed by our community, COIN100 ensures that every holder has
                a voice in the project future. Participate in voting on key
                decisions, fostering a truly decentralized ecosystem.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="secondary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Dynamic Supply Adjustment
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Our dynamic supply adjustment mechanism responds to market
                movements, maintaining price stability and aligning with the
                overall market cap of the tracked index. This ensures COIN100
                remains a true reflection of the cryptocurrency market.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }} id="features">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Key Features
        </Typography>
        <Grid container spacing={6} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Fade in timeout={1000 + index * 200}>
                <FeatureBox elevation={3}>
                  <Box sx={{ mb: 4 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </FeatureBox>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Tokenomics Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          py: 10,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Tokenomics
          </Typography>
          <Grid container spacing={6} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4] }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                      component="img"
                      src={logo}
                      alt="COIN100 Logo"
                      sx={{ width: 80, height: 80 }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Supply Mechanism
                  </Typography>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    COIN100 employs a dynamic supply adjustment mechanism that
                    automatically adjusts the total supply based on the market
                    capitalization of the top 100 cryptocurrencies. This ensures
                    that the token remains a true reflection of the underlying
                    index, maintaining its relevance and accuracy in tracking
                    market movements.
                  </Typography>
                  <Divider sx={{ my: 3 }} />
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Transaction Fees
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <strong>Burn Fee:</strong> A portion of each transaction is
                    burned, reducing the total supply over time and potentially
                    increasing the value of remaining tokens.
                    <br />
                    <strong>Reward Fee:</strong> A portion of each transaction
                    is allocated for rewards distribution to liquidity providers
                    and upkeep users, incentivizing long-term participation.
                    <br />
                    <strong>Liquidity Pool Allocation:</strong> 5% of each
                    transaction is allocated to the liquidity pool, ensuring
                    ample liquidity for smooth trading experiences.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4] }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                      component="img"
                      src={logo}
                      alt="COIN100 Logo"
                      sx={{ width: 80, height: 80 }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Rewards Distribution
                  </Typography>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    <strong>Liquidity Providers:</strong> Earn rewards for
                    providing liquidity to the COIN100 pool, enhancing market
                    stability and trading efficiency.
                    <br />
                    <strong>UpKeepers:</strong> Individuals who manually run
                    upkeep tasks are rewarded for maintaining the system’s
                    integrity, ensuring continuous and reliable operations.
                  </Typography>
                  <Divider sx={{ my: 3 }} />
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Total Supply
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    - <strong>Total Supply:</strong> 1,000,000,000 C100 tokens
                    <br />- <strong>Decimals:</strong> 18
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Governance Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Governance
        </Typography>
        <Grid container spacing={6} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <FeatureBox elevation={3}>
                <Box sx={{ mb: 3 }}>
                  <GavelIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Decentralized Voting 🗳️
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Participate in voting on key decisions such as asset
                  inclusion, protocol upgrades, and fee adjustments. Your vote
                  ensures that COIN100 evolves in a direction that benefits the
                  entire community.
                </Typography>
              </FeatureBox>
            </Fade>
          </Grid>
          <Grid item xs={12} md={6}>
            <Fade in timeout={1200}>
              <FeatureBox elevation={3}>
                <Box sx={{ mb: 3 }}>
                  <SyncIcon color="secondary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Transparent Operations 🔍
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  All governance actions and supply adjustments are executed
                  transparently through smart contracts, ensuring trust and
                  accountability within the ecosystem.
                </Typography>
              </FeatureBox>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* Rewards Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          py: 10,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Rewards & Incentives
          </Typography>
          <Grid container spacing={6} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Fade in timeout={1400}>
                <FeatureBox elevation={3}>
                  <Box sx={{ mb: 3 }}>
                    <TrendingUpIcon color="primary" sx={{ fontSize: 60 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Staking Rewards 💰
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Earn passive income by staking your COIN100 tokens. Enjoy
                    competitive yields while contributing to the stability of
                    the ecosystem.
                  </Typography>
                </FeatureBox>
              </Fade>
            </Grid>
            <Grid item xs={12} md={4}>
              <Fade in timeout={1600}>
                <FeatureBox elevation={3}>
                  <Box sx={{ mb: 3 }}>
                    <EmojiEventsIcon color="secondary" sx={{ fontSize: 60 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Transaction Fees 💸
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    A portion of every transaction fee is redistributed to
                    COIN100 holders, providing continuous rewards as the network
                    grows.
                  </Typography>
                </FeatureBox>
              </Fade>
            </Grid>
            <Grid item xs={12} md={4}>
              <Fade in timeout={1800}>
                <FeatureBox elevation={3}>
                  <Box sx={{ mb: 3 }}>
                    <PeopleIcon color="primary" sx={{ fontSize: 60 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    UpKeepers Rewards 🛠️
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    UpKeepers who manually maintain the system are rewarded for
                    their efforts, ensuring the smooth operation and integrity
                    of the COIN100 ecosystem.
                  </Typography>
                </FeatureBox>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Why Choose COIN100 Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Why Choose <strong>COIN100</strong>?
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          maxWidth="800px"
          mx="auto"
          paragraph
          sx={{ mt: 4 }}
        >
          COIN100 is revolutionizing the way you invest in cryptocurrencies. By
          providing a decentralized index fund that dynamically tracks the top
          100 cryptocurrencies by market capitalization, we offer unparalleled
          diversification, security, and rewards. Whether you are a seasoned
          investor or just getting started, COIN100 simplifies your investment
          journey, ensuring you stay ahead in the fast-paced crypto market.
        </Typography>
        <Box textAlign="center" sx={{ mt: 8 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleBuyToken}
            startIcon={
              <Box
                component="img"
                src={logo}
                alt="COIN100 Logo"
                sx={{ width: 24, height: 24 }}
              />
            }
            sx={{
              borderRadius: 50,
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: theme.shadows[4],
              transition: 'box-shadow 0.3s, transform 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'scale(1.05)',
              },
            }}
          >
            {loading
              ? 'Connecting...'
              : walletAddress
                ? 'Go to Dashboard'
                : 'Buy Token'}
          </Button>
        </Box>
      </Container>

      {/* Footer CTA */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          py: 8,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Coin Logo as Background Element */}
        <Box
          component="img"
          src={logo}
          alt="COIN100 Logo"
          sx={{
            width: 200,
            height: 200,
            position: 'absolute',
            top: -100,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0.1,
            zIndex: 1,
          }}
        />
        <Container maxWidth="md">
          {/* Coin Logo Next to CTA */}
          <Box
            component="img"
            src={logo}
            alt="COIN100 Logo"
            sx={{
              width: 100,
              height: 100,
              margin: '0 auto',
              mb: 4,
            }}
          />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Invest in the Future of Crypto?
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleBuyToken}
            startIcon={
              <Box
                component="img"
                src={logo}
                alt="COIN100 Logo"
                sx={{ width: 24, height: 24 }}
              />
            }
            sx={{
              borderRadius: 50,
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              textTransform: 'none',
              mt: 6,
              boxShadow: theme.shadows[4],
              transition: 'box-shadow 0.3s, transform 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'scale(1.05)',
              },
            }}
          >
            {loading
              ? 'Connecting...'
              : walletAddress
                ? 'Go to Dashboard'
                : 'Buy Token'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
