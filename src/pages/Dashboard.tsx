// src/pages/Dashboard.tsx

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Slide,
  IconButton,
  useTheme,
  Chip,
} from '@mui/material';
import { LineChart, BarChart } from '@mui/x-charts';
import {
  AccountBalanceWallet,
  SwapHoriz,
  TrendingUp,
  Analytics,
  Refresh,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchTopCoins } from '../store/slices/coingeckoSlice';

const WalletPanel = () => {
  const theme = useTheme();
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(45deg, #1a237e 30%, #311b92 90%)'
            : 'linear-gradient(45deg, #3f51b5 30%, #5e35b1 90%)',
        color: 'white',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccountBalanceWallet sx={{ mr: 1 }} />
        <Typography variant="h6">Wallet Balance</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">C100 Balance</Typography>
          <Typography variant="h5">1,234.56 C100</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">USD Value</Typography>
          <Typography variant="h5">$5,678.90</Typography>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Chip
          icon={<TrendingUp />}
          label="+12.34% (24h)"
          color="success"
          sx={{ mr: 1 }}
        />
        <Chip
          icon={<SwapHoriz />}
          label="Swap"
          variant="outlined"
          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
        />
      </Box>
    </Paper>
  );
};

const MarketOverview = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { topCoins, loading } = useAppSelector((state) => state.coingecko);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  // Mock data for charts - replace with real data
  const chartData = {
    xAxis: [{ data: [1, 2, 3, 4, 5, 6, 7] }],
    series: [{ data: [2, 5.5, 2, 8.5, 1.5, 5, 3] }],
  };

  const marketCapData = topCoins.slice(0, 10).map((coin) => ({
    value: coin.market_cap,
    label: coin.symbol.toUpperCase(),
  }));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Slide direction="right" in={!selectedCoin} mountOnEnter unmountOnExit>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Analytics sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ flex: 1 }}>
                Market Overview
              </Typography>
              <IconButton
                onClick={() => dispatch(fetchTopCoins())}
                disabled={loading}
              >
                <Refresh />
              </IconButton>
            </Box>
            <BarChart
              dataset={marketCapData}
              xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
              series={[{ dataKey: 'value', label: 'Market Cap' }]}
              height={300}
            />
          </Paper>
        </Slide>
      </Grid>
      <Grid item xs={12} md={6}>
        <Slide direction="left" in={!!selectedCoin} mountOnEnter unmountOnExit>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Price History
            </Typography>
            <LineChart
              xAxis={chartData.xAxis}
              series={chartData.series}
              height={300}
            />
          </Paper>
        </Slide>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top 100 Coins
          </Typography>
          <Grid container spacing={2}>
            {topCoins.map((coin) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={coin.id}>
                <Paper
                  onClick={() => setSelectedCoin(coin.id)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                    bgcolor:
                      selectedCoin === coin.id
                        ? theme.palette.mode === 'dark'
                          ? 'grey.800'
                          : 'grey.100'
                        : 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      style={{ width: 24, height: 24, marginRight: 8 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">
                        {coin.symbol.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${coin.current_price.toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`${coin.price_change_percentage_24h?.toFixed(2)}%`}
                      color={
                        coin.price_change_percentage_24h >= 0
                          ? 'success'
                          : 'error'
                      }
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <WalletPanel />
        </Grid>
        <Grid item xs={12} md={8}>
          <MarketOverview />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
