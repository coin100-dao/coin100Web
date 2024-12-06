import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Grid,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import { Close, TrendingUp, TrendingDown } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts';
import { CoinData } from '../../services/api';
import { formatNumber, formatPercentage } from '../../utils/general';
import { TabPanel } from './TabPanel';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCoinBySymbol } from '../../store/slices/coin100Slice';

interface CoinDetailDialogProps {
  coin: CoinData | null;
  open: boolean;
  onClose: () => void;
}

const PERIOD_OPTIONS = [
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '12h', label: '12 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
];

const DEFAULT_PERIOD = '5m';

export const CoinDetailDialog: React.FC<CoinDetailDialogProps> = ({
  coin,
  open,
  onClose,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { coinHistory, selectedCoin, loadingSymbols, lastSymbolFetch } =
    useAppSelector((state) => state.coin100);

  // Function to check if we should fetch data
  const shouldFetchData = useCallback(
    (symbol: string) => {
      const now = Date.now();
      const lastFetch = lastSymbolFetch[symbol] || 0;
      const timeSinceLastFetch = now - lastFetch;
      return timeSinceLastFetch > 5000; // Only fetch if more than 5 seconds have passed
    },
    [lastSymbolFetch]
  );

  // Function to fetch data
  const fetchData = useCallback(() => {
    if (!coin?.symbol || !open || loadingSymbols[coin.symbol]) {
      return;
    }

    if (!shouldFetchData(coin.symbol)) {
      return;
    }

    dispatch(fetchCoinBySymbol({ symbol: coin.symbol, period }));
  }, [coin?.symbol, period, open, dispatch, shouldFetchData, loadingSymbols]);

  // Initial data fetch when dialog opens or period changes
  useEffect(() => {
    if (open && coin?.symbol) {
      fetchData();
    }
  }, [open, coin?.symbol, period, fetchData]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    fetchData();
  };

  if (!coin || !open) {
    return null;
  }

  const priceChange = coin.price_change_percentage_24h ?? 0;
  const isPositive = priceChange > 0;
  const isLoading = loadingSymbols[coin.symbol] || false;

  const currentHistory = coinHistory[coin.symbol] || {
    prices: [],
    timestamps: [],
    period: DEFAULT_PERIOD,
    lastUpdated: 0,
  };

  // Prepare chart data
  const chartData = {
    xAxis: [
      {
        data: currentHistory.timestamps,
        scaleType: 'time' as const,
        id: 'timestamp-axis',
      },
    ],
    series: [
      {
        data: currentHistory.prices,
        area: true,
        color: isPositive
          ? theme.palette.success.main
          : theme.palette.error.main,
        showMark: false,
      },
    ],
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div">
            {coin.name || 'Unknown'} ({coin.symbol?.toUpperCase() || 'N/A'})
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={3}>
          <Typography variant="h4" fontWeight="bold">
            ${formatNumber(selectedCoin?.current_price || coin.current_price)}
          </Typography>
          <Chip
            icon={isPositive ? <TrendingUp /> : <TrendingDown />}
            label={formatPercentage(priceChange)}
            color={isPositive ? 'success' : 'error'}
            size="small"
          />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
          >
            <Tab label="Overview" />
            <Tab label="Price Chart" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">Market Cap</Typography>
              <Typography variant="h6">
                ${formatNumber(coin.market_cap)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">24h Volume</Typography>
              <Typography variant="h6">
                ${formatNumber(coin.total_volume)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">24h High</Typography>
              <Typography variant="h6">
                ${formatNumber(coin.high_24h)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">24h Low</Typography>
              <Typography variant="h6">
                ${formatNumber(coin.low_24h)}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={period === option.value ? 'contained' : 'outlined'}
                onClick={() => handlePeriodChange(option.value)}
                disabled={isLoading}
              >
                {option.label}
              </Button>
            ))}
          </Box>

          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height={400}
            >
              <CircularProgress />
            </Box>
          ) : currentHistory.prices.length > 0 ? (
            <LineChart
              xAxis={chartData.xAxis}
              series={chartData.series}
              width={500}
              height={400}
            />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height={400}
            >
              <Typography>No data available</Typography>
            </Box>
          )}
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};
