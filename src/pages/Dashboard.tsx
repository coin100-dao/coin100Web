// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { Box, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAllCoins,
  fetchTotalMarketCap,
} from '../store/slices/coin100Slice';
import {
  TotalMarketCap,
  WalletBalance,
  CoinList,
  CoinChart,
} from '../components/dashboard';

const DEFAULT_PERIOD = '5m';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { selectedCoin } = useAppSelector((state) => state.coin100);
  const walletAddress = useAppSelector((state) => state.web3.walletAddress);

  useEffect(() => {
    // Initial fetch
    dispatch(fetchAllCoins(DEFAULT_PERIOD));
    dispatch(fetchTotalMarketCap(DEFAULT_PERIOD));

    // Set up periodic refresh
    const interval = setInterval(() => {
      dispatch(fetchAllCoins(DEFAULT_PERIOD));
      dispatch(fetchTotalMarketCap(DEFAULT_PERIOD));
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: { xs: 'auto', sm: 'calc(100vh - 64px)' },
        p: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 2 },
        overflow: { xs: 'auto', sm: 'hidden' },
      }}
    >
      {/* Top Section */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ height: '100%' }}>
          {/* Wallet Section */}
          <Grid item xs={12} sm={12} md={2.4}>
            <WalletBalance isWalletConnected={!!walletAddress} />
          </Grid>
          {/* Market Cap Chart */}
          <Grid item xs={12} sm={12} md={9.6}>
            <TotalMarketCap />
          </Grid>
        </Grid>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ flex: 1, minHeight: isMobile ? 'auto' : 0 }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ height: '100%' }}>
          {/* Coin List */}
          <Grid
            item
            xs={12}
            sm={isTablet ? 12 : 2.4}
            sx={{
              height: isMobile ? 'auto' : '100%',
              order: { xs: 2, md: 1 },
            }}
          >
            <CoinList selectedCoin={selectedCoin} />
          </Grid>
          {/* Selected Coin Chart */}
          <Grid
            item
            xs={12}
            sm={isTablet ? 12 : 9.6}
            sx={{
              height: isMobile ? 'auto' : '100%',
              order: { xs: 1, md: 2 },
            }}
          >
            <CoinChart height={isMobile ? 300 : '100%'} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
