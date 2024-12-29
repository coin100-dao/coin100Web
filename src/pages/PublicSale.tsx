import React, { useEffect, useState } from 'react';
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
} from '../store/slices/publicSaleSlice';
import { BuySection } from '../components/sale/BuySection';
import SaleInfo from '../components/sale/SaleInfo';
import Stats from '../components/sale/Stats';
import ActivityLog from '../components/sale/ActivityLog';
import { AccountBalanceWallet } from '@mui/icons-material';
import MetaMaskPopup from '../components/wallet/MetaMaskPopup';

const PublicSale: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);

  const { loading, error, isInitialized } = useSelector(
    (state: RootState) => state.publicSale
  );
  const { address: walletAddress, isConnected } = useSelector(
    (state: RootState) => state.wallet
  );

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing PublicSale page...');
        console.log('Current state:', {
          isInitialized,
          walletAddress,
          isConnected,
          loading,
          error,
        });

        if (!isInitialized) {
          const result = await dispatch(initializeContractData()).unwrap();
          console.log('Contract data initialized successfully:', result);
        }

        // After initialization, try to fetch data if wallet is connected
        if (isConnected && walletAddress) {
          console.log('Wallet already connected, fetching initial data...');
          dispatch(fetchPublicSaleData());
        }
      } catch (error) {
        console.error('Failed to initialize contract data:', error);
      }
    };
    init();
  }, [dispatch, isInitialized, walletAddress, isConnected]);

  useEffect(() => {
    if (isInitialized && isConnected && walletAddress) {
      console.log('Setting up data refresh...', {
        isInitialized,
        walletAddress,
        isConnected,
      });

      // Initial fetch
      console.log('Fetching initial public sale data...');
      dispatch(fetchPublicSaleData());

      // Set up interval
      console.log('Setting up data refresh interval...');
      const interval = setInterval(() => {
        console.log('Refreshing public sale data...');
        dispatch(fetchPublicSaleData());
      }, 15000);

      return () => {
        console.log('Cleaning up data refresh interval...');
        clearInterval(interval);
      };
    } else {
      console.log('Not setting up refresh - conditions not met:', {
        isInitialized,
        walletAddress,
        isConnected,
      });
    }
  }, [dispatch, walletAddress, isInitialized, isConnected]);

  const handleConnectClick = () => {
    setConnectDialogOpen(true);
  };

  const handleConnectSuccess = () => {
    console.log('Wallet connected successfully, fetching data...');
    dispatch(fetchPublicSaleData());
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

        {!isConnected ? (
          <Card
            sx={{
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center',
              p: 4,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              boxShadow: theme.shadows[10],
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Connect Your Wallet
              </Typography>
              <Typography color="textSecondary" paragraph>
                Please connect your wallet to participate in the COIN100 public
                sale.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleConnectClick}
                startIcon={<AccountBalanceWallet />}
                disabled={loading}
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <BuySection />
            </Grid>
            <Grid item xs={12} md={4}>
              <SaleInfo />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 4 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stats />
            </Grid>
            <Grid item xs={12} md={6}>
              <ActivityLog />
            </Grid>
          </Grid>
        )}
      </Container>

      {/* MetaMask Popup */}
      <MetaMaskPopup
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        onSuccess={handleConnectSuccess}
      />
    </Box>
  );
};

export default PublicSale;
