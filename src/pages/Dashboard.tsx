// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAllCoins,
  fetchTotalMarketCap,
} from '../store/slices/coin100Slice';
import { TotalMarketCap, WalletBalance } from '../components/dashboard';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const walletAddress = useAppSelector((state) => state.web3.walletAddress);

  useEffect(() => {
    // Initial fetch
    const endTime = new Date().toISOString(); // Current time in ISO format
    const startTime = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago

    dispatch(fetchAllCoins({ start: startTime, end: endTime }));
    dispatch(fetchTotalMarketCap({ start: startTime, end: endTime }));

    // Set up periodic refresh
    const interval = setInterval(() => {
      const endTime = new Date().toISOString(); // Current time in ISO format
      const startTime = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago

      dispatch(fetchAllCoins({ start: startTime, end: endTime }));
      dispatch(fetchTotalMarketCap({ start: startTime, end: endTime }));
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
    </Box>
  );
};

export default Dashboard;
