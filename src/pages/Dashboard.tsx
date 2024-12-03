// src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  useTheme,
  Chip,
  Button,
  Tooltip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LineChart, BarChart } from '@mui/x-charts';
import {
  AccountBalanceWallet,
  SwapHoriz,
  TrendingUp,
  TrendingDown,
  Timeline,
  ShowChart,
  CompareArrows,
  Assessment,
  FilterList,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  fetchTopCoins,
  fetchGlobalMarketData,
  fetchHistoricalMarketCap,
} from '../store/slices/coingeckoSlice';

const REFRESH_INTERVAL = 30000; // 30 seconds

// Helper functions
const formatNumber = (num: number, decimals = 2) => {
  if (num >= 1e12) return (num / 1e12).toFixed(decimals) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
};

// Components
const WalletPanel = () => {
  const theme = useTheme();
  const { tokenBalance } = useAppSelector((state) => state.web3);
  const { topCoins } = useAppSelector((state) => state.coingecko);

  const c100Price =
    topCoins.find((coin) => coin.symbol === 'c100')?.current_price || 0;
  const balanceInUSD = parseFloat(tokenBalance || '0') * c100Price;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(45deg, #1a237e 30%, #311b92 90%)'
            : 'linear-gradient(45deg, #3f51b5 30%, #5e35b1 90%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalanceWallet sx={{ mr: 1 }} />
          <Typography variant="h6">Wallet Balance</Typography>
          <Tooltip title="View transaction history">
            <IconButton size="small" sx={{ ml: 'auto', color: 'white' }}>
              <Timeline />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2">C100 Balance</Typography>
            <Typography variant="h5">{tokenBalance || '0'} C100</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2">USD Value</Typography>
            <Typography variant="h5">${balanceInUSD.toFixed(2)}</Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Chip
            icon={<ShowChart />}
            label={`$${c100Price.toFixed(6)} USD`}
            color="success"
          />
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            size="small"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Swap
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

const GlobalMarketStats = () => {
  const theme = useTheme();
  const { globalMarketData, globalHistoricalData, loading } = useAppSelector(
    (state) => state.coingecko
  );

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!globalMarketData || !globalHistoricalData) return null;

  const marketCapChange = globalMarketData.market_cap_change_percentage_24h_usd;
  const totalMarketCap = globalMarketData.total_market_cap.usd;
  const totalVolume = globalMarketData.total_volume.usd;

  const chartData = globalHistoricalData.market_caps.map(
    ([timestamp, value]) => ({
      date: new Date(timestamp),
      value,
    })
  );

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Global Market Overview
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Market Cap
            </Typography>
            <Typography variant="h5">
              ${formatNumber(totalMarketCap)}
            </Typography>
            <Chip
              size="small"
              icon={marketCapChange >= 0 ? <TrendingUp /> : <TrendingDown />}
              label={`${marketCapChange.toFixed(2)}%`}
              color={marketCapChange >= 0 ? 'success' : 'error'}
              sx={{ mt: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" color="text.secondary">
              24h Volume
            </Typography>
            <Typography variant="h5">${formatNumber(totalVolume)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" color="text.secondary">
              BTC Dominance
            </Typography>
            <Typography variant="h5">
              {globalMarketData.market_cap_percentage.btc.toFixed(1)}%
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <LineChart
        dataset={chartData}
        xAxis={[{ dataKey: 'date', scaleType: 'time' }]}
        series={[
          {
            dataKey: 'value',
            label: 'Market Cap (USD)',
            color: theme.palette.primary.main,
            area: true,
          },
        ]}
        height={300}
      />
    </Paper>
  );
};

const MarketMovers = () => {
  const { topCoins, loading } = useAppSelector((state) => state.coingecko);

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  const sortedByGain = [...topCoins].sort(
    (a, b) =>
      (b.price_change_percentage_24h || 0) -
      (a.price_change_percentage_24h || 0)
  );

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Top Movers (24h)
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" color="success.main" gutterBottom>
            Top Gainers
          </Typography>
          {sortedByGain.slice(0, 5).map((coin) => (
            <Box
              key={coin.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <img
                src={coin.image}
                alt={coin.name}
                style={{ width: 20, height: 20, marginRight: 8 }}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {coin.symbol.toUpperCase()}
              </Typography>
              <Chip
                size="small"
                label={`+${coin.price_change_percentage_24h?.toFixed(2)}%`}
                color="success"
              />
            </Box>
          ))}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" color="error.main" gutterBottom>
            Top Losers
          </Typography>
          {sortedByGain
            .slice(-5)
            .reverse()
            .map((coin) => (
              <Box
                key={coin.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  style={{ width: 20, height: 20, marginRight: 8 }}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {coin.symbol.toUpperCase()}
                </Typography>
                <Chip
                  size="small"
                  label={`${coin.price_change_percentage_24h?.toFixed(2)}%`}
                  color="error"
                />
              </Box>
            ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

const MarketAnalytics = () => {
  const theme = useTheme();
  const { topCoins, loading } = useAppSelector((state) => state.coingecko);

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  const marketCapData = topCoins.slice(0, 10).map((coin) => ({
    name: coin.symbol.toUpperCase(),
    value: coin.market_cap,
  }));

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Market Analytics
        </Typography>
        <Button
          size="small"
          startIcon={<FilterList />}
          // onClick={(e) => {/* Add filter menu */}}
        >
          Filter
        </Button>
      </Box>
      <BarChart
        dataset={marketCapData}
        xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
        series={[
          {
            dataKey: 'value',
            label: 'Market Cap (USD)',
            color: theme.palette.primary.main,
          },
        ]}
        height={300}
      />
    </Paper>
  );
};

const MarketSentiment: React.FC = () => {
  const theme = useTheme();
  const { globalMarketData, loading } = useAppSelector(
    (state) => state.coingecko
  );

  if (loading) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          height: '100%',
          background: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!globalMarketData) return null;

  const sentimentScore = globalMarketData.market_cap_change_percentage_24h_usd;
  const isBullish = sentimentScore > 0;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        background: theme.palette.background.paper,
      }}
    >
      <Typography
        variant="h6"
        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
      >
        <Assessment sx={{ mr: 1 }} />
        Market Sentiment
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="textSecondary">
            24h Market Sentiment
          </Typography>
          <Typography
            variant="h4"
            color={isBullish ? 'success.main' : 'error.main'}
          >
            {sentimentScore.toFixed(2)}%
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Chip
            icon={isBullish ? <TrendingUp /> : <TrendingDown />}
            label={isBullish ? 'Bullish' : 'Bearish'}
            color={isBullish ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>
      </Box>
      <Tooltip title="Market sentiment based on 24h market cap change">
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(Math.max((sentimentScore + 100) / 2, 0), 100)}
            color={isBullish ? 'success' : 'error'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Tooltip>
    </Paper>
  );
};

const TradingVolumeAnalysis: React.FC = () => {
  const theme = useTheme();
  const { topCoins, loading } = useAppSelector((state) => state.coingecko);

  if (loading) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          height: '100%',
          background: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  const totalVolume = topCoins.reduce(
    (sum, coin) => sum + coin.total_volume,
    0
  );
  const volumeDistribution = topCoins.slice(0, 5).map((coin) => ({
    name: coin.name,
    volume: coin.total_volume,
    percentage: (coin.total_volume / totalVolume) * 100,
  }));

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        background: theme.palette.background.paper,
      }}
    >
      <Typography
        variant="h6"
        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
      >
        <CompareArrows sx={{ mr: 1 }} />
        Trading Volume Analysis
      </Typography>
      <Box sx={{ height: 300 }}>
        <BarChart
          xAxis={[
            {
              scaleType: 'band',
              data: volumeDistribution.map((item) => item.name),
            },
          ]}
          series={[
            {
              data: volumeDistribution.map((item) => item.volume / 1e9),
              label: 'Trading Volume (Billion USD)',
            },
          ]}
          height={300}
        />
      </Box>
    </Paper>
  );
};

const HistoricalMarketCapChart = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '24h' | '7d' | '30d' | '90d' | '1y'
  >('7d');
  const { globalHistoricalDataByRange, loading } = useAppSelector(
    (state) => state.coingecko
  );

  useEffect(() => {
    const data = globalHistoricalDataByRange[selectedTimeRange];
    const now = Date.now();
    if (!data || now - data.lastFetched > 5 * 60 * 1000) {
      dispatch(fetchHistoricalMarketCap(selectedTimeRange));
    }
  }, [selectedTimeRange, dispatch]);

  const timeRangeButtons = [
    { label: '24H', value: '24h' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' },
  ];

  const data = globalHistoricalDataByRange[selectedTimeRange];
  const chartData =
    data?.market_caps.map(([timestamp, value]) => ({
      time: new Date(timestamp),
      value: value,
    })) || [];

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        background: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h6">Total Market Cap History</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {timeRangeButtons.map(({ label, value }) => (
            <Button
              key={value}
              size="small"
              variant={selectedTimeRange === value ? 'contained' : 'outlined'}
              onClick={() =>
                setSelectedTimeRange(value as typeof selectedTimeRange)
              }
            >
              {label}
            </Button>
          ))}
        </Box>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      ) : chartData.length > 0 ? (
        <Box sx={{ height: 300 }}>
          <LineChart
            dataset={chartData}
            xAxis={[
              {
                dataKey: 'time',
                scaleType: 'time',
                valueFormatter: (value: Date) => value.toLocaleDateString(),
              },
            ]}
            yAxis={[
              {
                dataKey: 'value',
                valueFormatter: (value: number) => `$${formatNumber(value)}`,
              },
            ]}
            series={[
              {
                dataKey: 'value',
                label: 'Market Cap (USD)',
                color: theme.palette.primary.main,
                area: true,
              },
            ]}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 300,
          }}
        >
          <Typography>No data available</Typography>
        </Box>
      )}
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTopCoins());
    dispatch(fetchGlobalMarketData());

    const interval = setInterval(() => {
      dispatch(fetchTopCoins());
      dispatch(fetchGlobalMarketData());
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Wallet and Market Cap History */}
        <Grid size={{ xs: 12, md: 4 }}>
          <WalletPanel />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <HistoricalMarketCapChart />
        </Grid>

        {/* Global Market Stats */}
        <Grid size={{ xs: 12 }}>
          <GlobalMarketStats />
        </Grid>

        {/* Market Movers and Analytics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MarketMovers />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <MarketAnalytics />
        </Grid>

        {/* Trading Volume and Sentiment */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TradingVolumeAnalysis />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <MarketSentiment />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
