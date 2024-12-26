// ICO.tsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  Box,
  Container,
  Grid,
  useTheme,
  Typography,
  LinearProgress,
  Paper,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { fetchICOData, initializeContractData } from '../store/slices/icoSlice';
import { connectWallet } from '../store/slices/web3Slice';
import BuySection from '../components/ico/BuySection';
import SaleInfo from '../components/ico/SaleInfo';
import Stats from '../components/ico/Stats';
import ICOHero from '../components/home/ICOHero';
import { formatDistanceToNow } from 'date-fns';
import { AccessTime, AccountBalanceWallet } from '@mui/icons-material';

const ICO: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const {
    icoStartTime,
    icoEndTime,
    isFinalized,
    totalSold,
    remainingTokens,
    isIcoActive,
    loading: icoLoading,
    error: icoError,
    isInitialized,
  } = useSelector((state: RootState) => state.ico);

  const {
    walletAddress,
    balance,
    loading: walletLoading,
    error: walletError,
  } = useSelector((state: RootState) => state.web3);

  useEffect(() => {
    const init = async () => {
      try {
        await dispatch(initializeContractData()).unwrap();
      } catch (error) {
        console.error('Failed to initialize contract data:', error);
      }
    };
    init();
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized && walletAddress) {
      dispatch(fetchICOData());
      const interval = setInterval(() => {
        dispatch(fetchICOData());
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [dispatch, walletAddress, isInitialized]);

  const totalSupply = parseFloat(totalSold) + parseFloat(remainingTokens);
  const progress = (parseFloat(totalSold) / totalSupply) * 100;
  const timeLeft = icoEndTime * 1000 - Date.now();
  const now = Math.floor(Date.now() / 1000);
  const saleNotStarted = now < icoStartTime;
  // const saleEnded = now > icoEndTime;

  const handleConnectWallet = async () => {
    try {
      await dispatch(connectWallet()).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusMessage = () => {
    if (saleNotStarted) {
      return {
        text: `Sale starts ${formatDistanceToNow(icoStartTime * 1000, { addSuffix: true })}`,
        color: theme.palette.warning.main,
      };
    }
    // if (saleEnded) {
    //   return {
    //     text: 'Sale has ended',
    //     color: theme.palette.error.main,
    //   };
    // }
    if (isIcoActive) {
      return {
        text: `Sale ends ${formatDistanceToNow(icoEndTime * 1000, { addSuffix: true })}`,
        color: theme.palette.success.main,
      };
    }
    if (isFinalized) {
      return {
        text: 'Sale has been finalized',
        color: theme.palette.error.main,
      };
    }
    return {
      text: 'Sale is not active',
      color: theme.palette.error.main,
    };
  };

  const status = getStatusMessage();
  const loading = icoLoading || walletLoading;
  const error = icoError || walletError;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 6 },
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 50%, ${theme.palette.secondary.dark} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${theme.palette.background.paper}40 0%, ${theme.palette.background.default} 100%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box mb={6} textAlign="center">
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 2px 10px ${theme.palette.primary.main}40`,
              position: 'relative',
              zIndex: 1,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'inherit',
                filter: 'blur(10px)',
                opacity: 0.3,
                zIndex: -1,
              },
            }}
          >
            COIN100 ICO/IDO Presale
          </Typography>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Your Gateway to the Top 100 Cryptocurrencies
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: status.color,
              mt: 2,
            }}
          >
            {status.text}
          </Typography>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        <Box sx={{ position: 'relative', mb: 1 }}>
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
          <ICOHero />
        </Box>

        {!walletAddress ? (
          <Card
            sx={{
              maxWidth: 600,
              mx: 'auto',
              mb: 4,
              background: `linear-gradient(135deg, ${theme.palette.background.paper}80 0%, ${theme.palette.background.paper}40 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.primary.dark}40`,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <AccountBalanceWallet
                sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                Connect Your Wallet
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 3 }}>
                Connect your wallet to participate in the COIN100 presale
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleConnectWallet}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 4,
                }}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={4}>
            {/* Sale Progress Card */}
            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper}80 0%, ${theme.palette.background.paper}40 100%)`,
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.primary.dark}40`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography variant="h5">Sale Progress</Typography>
                  <Typography variant="body1" color="textSecondary">
                    Your Balance: {parseFloat(balance).toFixed(4)} POL (ex
                    MATIC)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 24,
                    borderRadius: 2,
                    mb: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    },
                  }}
                />
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <Typography variant="body1">
                      {totalSold} C100 Sold
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body1">
                      {remainingTokens} C100 Remaining
                    </Typography>
                  </Grid>
                </Grid>
                {isIcoActive && timeLeft > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 2,
                    }}
                  >
                    <AccessTime sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {formatDistanceToNow(icoEndTime * 1000, {
                        addSuffix: true,
                      })}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Main Content Grid */}
            <Grid container item spacing={4}>
              <Grid item xs={12} md={6}>
                <BuySection />
              </Grid>
              <Grid item xs={12} md={6}>
                <SaleInfo />
              </Grid>
            </Grid>

            {/* Stats Section */}
            <Grid item xs={12}>
              <Stats />
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ICO;
