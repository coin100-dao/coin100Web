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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Diversity1 as DiversifyIcon,
  EmojiEvents as EmojiEventsIcon,
  AccountBalance as AccountBalanceIcon,
  EmojiNature as EmojiNatureIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { connectWallet } from '../store/slices/web3Slice';
import MetaMaskIcon from '../assets/MetaMask_Fox.svg';

const FeatureBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.primary,
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
  },
}));

const Home: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { walletAddress, loading } = useAppSelector((state) => state.web3);

  const handleBuyToken = () => {
    if (walletAddress) {
      // Navigate to Dashboard
      window.location.href = '/dashboard';
    } else {
      // Connect Wallet
      dispatch(connectWallet());
    }
  };

  const features = [
    {
      icon: <TrendingUpIcon color="primary" sx={{ fontSize: 50 }} />,
      title: 'Dynamic Rebase Mechanism 🚀',
      description:
        'Adjusts the token supply based on market cap to maintain stability and reflect the true value of the index.',
    },
    {
      icon: <SecurityIcon color="secondary" sx={{ fontSize: 50 }} />,
      title: 'Robust Security 🔒',
      description:
        'Built with top-tier security measures to protect your investments and ensure contract integrity.',
    },
    {
      icon: <DiversifyIcon color="primary" sx={{ fontSize: 50 }} />,
      title: 'Diversified Portfolio 📊',
      description:
        'Gain exposure to the top 100 cryptocurrencies, minimizing risks associated with individual assets.',
    },
    {
      icon: <EmojiEventsIcon color="secondary" sx={{ fontSize: 50 }} />,
      title: 'Rewarding Holders 🏆',
      description:
        'Earn rewards automatically through transaction fees, incentivizing long-term participation.',
    },
    {
      icon: <AccountBalanceIcon color="primary" sx={{ fontSize: 50 }} />,
      title: 'Decentralized Governance 🗳️',
      description:
        'Participate in decision-making processes, ensuring the community drives the project’s future.',
    },
    {
      icon: <EmojiNatureIcon color="secondary" sx={{ fontSize: 50 }} />,
      title: 'Eco-Friendly on Polygon 🌱',
      description:
        'Leveraging the Polygon network for low fees and high scalability with minimal environmental impact.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: '#fff',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" gutterBottom>
            Welcome to <strong>COIN100</strong>
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Your gateway to a diversified and secure cryptocurrency investment
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleBuyToken}
            startIcon={
              loading ? null : walletAddress ? (
                <Box
                  component="img"
                  src={MetaMaskIcon}
                  alt="MetaMask"
                  sx={{ width: 24, height: 24 }}
                />
              ) : (
                <SecurityIcon />
              )
            }
            sx={{
              borderRadius: 8,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
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

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          What is COIN100?
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          paragraph
        >
          COIN100 is a decentralized index fund that dynamically tracks the top
          100 cryptocurrencies by market capitalization. Our mission is to
          provide investors with a secure, diversified, and easily accessible
          way to participate in the cryptocurrency market without the
          complexities of managing individual assets.
        </Typography>
        <Divider sx={{ my: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Decentralization & Governance
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Governed by our community, COIN100 ensures that every holder has a
              voice in the project future. Participate in voting on key
              decisions, from asset inclusion to protocol upgrades, fostering a
              truly decentralized ecosystem.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Advanced Mechanisms
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Our dynamic rebase mechanism adjusts the token supply based on
              market conditions, maintaining price stability and reflecting the
              true value of the index. Coupled with robust security protocols,
              COIN100 offers a reliable investment platform.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="features">
        <Typography variant="h4" align="center" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={4} mt={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureBox elevation={3}>
                {feature.icon}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </FeatureBox>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Tokenomics Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.grey[100],
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            Tokenomics
          </Typography>
          <Grid container spacing={4} mt={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Supply
                  </Typography>
                  <Typography variant="h4" color="primary">
                    1,000,000 COIN100
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Allocation
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    <strong>50%</strong> Staking Rewards
                    <br />
                    <strong>20%</strong> Development
                    <br />
                    <strong>15%</strong> Marketing
                    <br />
                    <strong>10%</strong> Liquidity
                    <br />
                    <strong>5%</strong> Team
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribution
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    COIN100 is distributed fairly through liquidity mining,
                    staking rewards, and community incentives. Our transparent
                    distribution model ensures long-term sustainability and
                    value appreciation for our holders.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Dynamic Rebase
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    The dynamic rebase mechanism adjusts the token supply in
                    response to market movements, maintaining price stability
                    and aligning with the overall market cap of the tracked
                    index.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Rewards Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Rewards & Incentives
        </Typography>
        <Grid container spacing={4} mt={4}>
          <Grid item xs={12} md={4}>
            <FeatureBox elevation={3}>
              <TrendingUpIcon color="primary" sx={{ fontSize: 50 }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Staking Rewards
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Earn passive income by staking your COIN100 tokens. Enjoy
                competitive yields while contributing to the stability of the
                ecosystem.
              </Typography>
            </FeatureBox>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureBox elevation={3}>
              <EmojiEventsIcon color="secondary" sx={{ fontSize: 50 }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Transaction Fees
              </Typography>
              <Typography variant="body2" color="textSecondary">
                A portion of every transaction fee is redistributed to COIN100
                holders, providing continuous rewards as the network grows.
              </Typography>
            </FeatureBox>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureBox elevation={3}>
              <AccountBalanceIcon color="primary" sx={{ fontSize: 50 }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Community Incentives
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Participate in community activities and governance to earn
                exclusive rewards and influence the direction of COIN100.
              </Typography>
            </FeatureBox>
          </Grid>
        </Grid>
      </Container>

      {/* Footer CTA */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Ready to Invest in the Future of Crypto?
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleBuyToken}
            startIcon={
              loading ? null : walletAddress ? (
                <Box
                  component="img"
                  src={MetaMaskIcon}
                  alt="MetaMask"
                  sx={{ width: 24, height: 24 }}
                />
              ) : (
                <SecurityIcon />
              )
            }
            sx={{
              borderRadius: 8,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
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
