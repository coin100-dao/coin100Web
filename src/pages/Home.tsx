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
  Gavel as GavelIcon,
  Sync as SyncIcon,
  People as PeopleIcon,
  AccountBalance as LiquidityIcon,
  EmojiEvents as RewardIcon,
  HowToVote as VotingIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { connectWallet } from '../store/slices/web3Slice';
import MetaMaskIcon from '../assets/MetaMask_Fox.svg';

// Styled component for feature boxes
const FeatureBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.primary,
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow:
      theme?.shadows?.[4 as keyof typeof theme.shadows] ||
      '0px 4px 8px rgba(0, 0, 0, 0.2)', // Fallback shadow if theme.shadows is undefined
  },
}));

const Home: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { walletAddress, loading } = useAppSelector((state) => state.web3);

  // Handler for Buy Token button
  const handleBuyToken = () => {
    if (walletAddress) {
      // Navigate to Dashboard
      window.location.href = '/dashboard';
    } else {
      // Connect Wallet
      dispatch(connectWallet());
    }
  };

  // Array of feature objects
  const features = [
    {
      icon: <TrendingUpIcon color="primary" sx={{ fontSize: 50 }} />,
      title: 'Dynamic Supply Adjustment 🚀',
      description:
        'Our supply adjusts dynamically based on market conditions to maintain price stability and align with the overall crypto market performance.',
    },
    {
      icon: <SecurityIcon color="secondary" sx={{ fontSize: 50 }} />,
      title: 'Robust Security 🔒',
      description:
        'Built with top-tier security measures to protect your investments and ensure contract integrity on the Polygon network.',
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
      icon: <LiquidityIcon color="primary" sx={{ fontSize: 50 }} />,
      title: 'Liquidity Pool Allocation 💧',
      description:
        '5% of each transaction is allocated to the liquidity pool, ensuring ample liquidity for smooth trading experiences.',
    },
    {
      icon: <RewardIcon color="secondary" sx={{ fontSize: 50 }} />,
      title: 'Rewards for UpKeepers 🛠️',
      description:
        'UpKeepers who manually maintain the system are rewarded, ensuring the smooth operation and integrity of the COIN100 ecosystem.',
    },
    {
      icon: <VotingIcon color="primary" sx={{ fontSize: 50 }} />,
      title: 'Decentralized Governance 🗳️',
      description:
        'Participate in decision-making processes, ensuring the community drives the project’s future.',
    },
    {
      icon: <SyncIcon color="secondary" sx={{ fontSize: 50 }} />,
      title: 'Transparent Operations 🔍',
      description:
        'All governance actions and supply adjustments are executed transparently through smart contracts, ensuring trust and accountability.',
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
            A Decentralized Cryptocurrency Index Fund on Polygon
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
          **COIN100 (C100)** is a decentralized cryptocurrency index fund built
          on the Polygon network. It represents the top 100 cryptocurrencies by
          market capitalization, offering users a diversified portfolio that
          mirrors the performance of the overall crypto market. Inspired by
          traditional index funds like the S&P 500, our ultimate goal is to
          dynamically track and reflect the top 100 cryptocurrencies, ensuring
          COIN100 remains a relevant and accurate representation of the
          cryptocurrency market.
        </Typography>
        <Divider sx={{ my: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Decentralization & Governance
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Governed by our community, COIN100 ensures that every holder has a
              voice in the projects future. Participate in voting on key
              decisions, from asset inclusion to protocol upgrades, fostering a
              truly decentralized ecosystem.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Dynamic Supply Adjustment
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Our dynamic supply adjustment mechanism responds to market
              movements, maintaining price stability and aligning with the
              overall market cap of the tracked index. This ensures that COIN100
              remains a true reflection of the cryptocurrency market.
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
            <Grid item xs={12} sm={6} md={3} key={index}>
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
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Supply
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    - <strong>Total Supply:</strong> 1,000,000,000 C100 tokens
                    <br />- <strong>Decimals:</strong> 18
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Distribution
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    - <strong>Public Sale + Treasury:</strong> 90% (900,000,000
                    C100)
                    <br />- <strong>Rewards Pool:</strong> 10% (100,000,000
                    C100)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Transaction Fees
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    - <strong>Burn Fee:</strong> 1.2% (40% of total fees)
                    <br />- <strong>Reward Fee:</strong> 1.8% (60% of total
                    fees)
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Fee Allocation
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    - <strong>Burn Fee:</strong> Tokens are burned, reducing the
                    total supply and potentially increasing the value of
                    remaining tokens.
                    <br />- <strong>Reward Fee:</strong> Allocated to the
                    rewards pool and distributed to token holders and liquidity
                    providers.
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Liquidity Pool
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    - <strong>5% Allocation:</strong> Five percent of each
                    transaction is allocated to the liquidity pool, ensuring
                    ample liquidity for smooth trading experiences.
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
              <PeopleIcon color="primary" sx={{ fontSize: 50 }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                UpKeepers Rewards
              </Typography>
              <Typography variant="body2" color="textSecondary">
                UpKeepers who manually maintain the system are rewarded for
                their efforts, ensuring the smooth operation and integrity of
                the COIN100 ecosystem.
              </Typography>
            </FeatureBox>
          </Grid>
        </Grid>
      </Container>

      {/* Governance Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.grey[100],
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            Governance
          </Typography>
          <Grid container spacing={4} mt={4}>
            <Grid item xs={12} md={6}>
              <FeatureBox elevation={3}>
                <GavelIcon color="primary" sx={{ fontSize: 50 }} />
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Decentralized Voting
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Participate in voting on key decisions such as asset
                  inclusion, protocol upgrades, and fee adjustments. Your vote
                  ensures that COIN100 evolves in a direction that benefits the
                  entire community.
                </Typography>
              </FeatureBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <FeatureBox elevation={3}>
                <SyncIcon color="secondary" sx={{ fontSize: 50 }} />
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Transparent Operations
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  All governance actions and supply adjustments are executed
                  transparently through smart contracts, ensuring trust and
                  accountability within the ecosystem.
                </Typography>
              </FeatureBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Tokenomics Detailed Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={4} mt={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Adjusting Supply Mechanism
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  COIN100 employs a dynamic rebase mechanism that automatically
                  adjusts the token supply based on the total market
                  capitalization of the top 100 cryptocurrencies. This ensures
                  that the token remains a true reflection of the underlying
                  index, maintaining its relevance and accuracy in tracking
                  market movements.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Burn & Reward Fees
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  - <strong>Burn Fee:</strong> 1.2% of each transaction is
                  burned, reducing the total supply and potentially increasing
                  the value of remaining tokens.
                  <br />- <strong>Reward Fee:</strong> 1.8% of each transaction
                  is allocated to the rewards pool, which is distributed to
                  holders and liquidity providers.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Liquidity Pool Allocation
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  5% of each transaction is allocated to the liquidity pool,
                  ensuring ample liquidity for smooth trading experiences. This
                  allocation supports the token’s stability and facilitates
                  seamless interactions on decentralized exchanges.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Rewards Distribution
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  - <strong>Liquidity Providers:</strong> Earn rewards for
                  providing liquidity to the COIN100 pool.
                  <br />- <strong>UpKeepers:</strong> Individuals who manually
                  run upkeep tasks are rewarded for maintaining the system’s
                  integrity.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Roadmap Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.light,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            Roadmap
          </Typography>
          <Grid container spacing={4} mt={4}>
            <Grid item xs={12} md={3}>
              <FeatureBox elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Q1 2024
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  - Smart contract development and internal testing.
                  <br />
                  - Community building and initial marketing campaigns.
                  <br />
                  - Deployment on the Polygon network.
                  <br />- Listing on major DEXs.
                </Typography>
              </FeatureBox>
            </Grid>
            <Grid item xs={12} md={3}>
              <FeatureBox elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Q2 2024
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  - Integration with Chainlink oracles.
                  <br />
                  - Launch of liquidity pools and staking mechanisms.
                  <br />- Initial governance setup.
                </Typography>
              </FeatureBox>
            </Grid>
            <Grid item xs={12} md={3}>
              <FeatureBox elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Q3 2024
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  - Implementation of advanced governance features.
                  <br />
                  - Expansion of reward distribution systems.
                  <br />- Strategic partnerships and collaborations.
                </Typography>
              </FeatureBox>
            </Grid>
            <Grid item xs={12} md={3}>
              <FeatureBox elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Q4 2024
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  - Launch of automated portfolio rebalancing.
                  <br />
                  - Continuous security audits and upgrades.
                  <br />- Global marketing and user acquisition initiatives.
                </Typography>
              </FeatureBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

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
              mt: 4,
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
