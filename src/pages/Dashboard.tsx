// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useAppDispatch } from '../store/hooks';
import { fetchAllCoins } from '../store/slices/coin100Slice';
import { CoinData } from '../services/api';
import {
  TotalMarketCap,
  WalletBalance,
  CoinList,
  CoinChart,
} from '../components/dashboard';

const DEFAULT_PERIOD = '5m';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);

  useEffect(() => {
    // Initial fetch
    dispatch(fetchAllCoins(DEFAULT_PERIOD));

    // Set up periodic refresh
    const interval = setInterval(() => {
      dispatch(fetchAllCoins(DEFAULT_PERIOD));
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: 'calc(100vh - 64px)', // Adjust for AppBar height
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden',
      }}
    >
      {/* Top Section */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Wallet Section - 20% */}
          <Grid item xs={2.4}>
            <WalletBalance />
          </Grid>
          {/* Market Cap Chart - 80% */}
          <Grid item xs={9.6}>
            <TotalMarketCap />
          </Grid>
        </Grid>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Coin List - 20% */}
          <Grid item xs={2.4}>
            <CoinList
              onCoinSelect={setSelectedCoin}
              selectedCoin={selectedCoin}
            />
          </Grid>
          {/* Selected Coin Chart - 80% */}
          <Grid item xs={9.6}>
            <CoinChart selectedCoin={selectedCoin} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
