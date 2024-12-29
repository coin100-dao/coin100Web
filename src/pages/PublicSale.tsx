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
  Card,
  CardContent,
  Button,
  Divider,
} from '@mui/material';
import {
  fetchPublicSaleData,
  initializeContractData,
  connectWallet,
} from '../store/slices/publicSaleSlice';
import BuySection from '../components/sale/BuySection';
import SaleInfo from '../components/sale/SaleInfo';
import Stats from '../components/sale/Stats';
import ActivityLog from '../components/sale/ActivityLog';
import { AccountBalanceWallet } from '@mui/icons-material';

const PublicSale: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, isInitialized, walletAddress } = useSelector(
    (state: RootState) => state.publicSale
  );

  useEffect(() => {
    const init = async () => {
      try {
        await dispatch(initializeContractData()).unwrap();
        // After initialization, try to fetch data if wallet is connected
        if (walletAddress) {
          dispatch(fetchPublicSaleData());
        }
      } catch (error) {
        console.error('Failed to initialize contract data:', error);
      }
    };
    init();
  }, [dispatch, isInitialized, walletAddress]);

  useEffect(() => {
    if (isInitialized && walletAddress) {
      dispatch(fetchPublicSaleData());

      const interval = setInterval(() => {
        dispatch(fetchPublicSaleData());
      }, 15000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [dispatch, walletAddress, isInitialized]);

  const handleConnectWallet = async () => {
    try {
      await dispatch(connectWallet()).unwrap();

      dispatch(fetchPublicSaleData());
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

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
            COIN100 Public Sale
          </Typography>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Your Gateway to the Top 100 Cryptocurrencies
          </Typography>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
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
                Connect your wallet to participate in the COIN100 public sale
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
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={4}>
            {/* Stats Section */}
            <Grid item xs={12}>
              <Stats />
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

            {/* Activity Log Section */}
            <Grid item xs={12}>
              <Box mt={4}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  Recent Transactions
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <ActivityLog />
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default PublicSale;
