import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
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

const CHART_UPDATE_INTERVAL = 10000; // 10 seconds

export const CoinDetailDialog: React.FC<CoinDetailDialogProps> = ({
  coin,
  open,
  onClose,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState('5m');
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { coinHistory, selectedCoin } = useAppSelector(
    (state) => state.coin100
  );

  // Fetch initial data when dialog opens or period changes
  useEffect(() => {
    if (coin && open) {
      dispatch(fetchCoinBySymbol({ symbol: coin.symbol, period }));
    }
  }, [coin?.symbol, period, open, dispatch]);

  // Set up periodic updates when chart tab is active
  useEffect(() => {
    if (coin && open && tabValue === 1) {
      const intervalId = setInterval(() => {
        dispatch(fetchCoinBySymbol({ symbol: coin.symbol, period }));
      }, CHART_UPDATE_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [coin?.symbol, period, open, tabValue, dispatch]);

  if (!coin) return null;

  const priceChange = coin.price_change_percentage_24h ?? 0;
  const isPositive = priceChange > 0;

  const currentHistory = coinHistory[coin.symbol] || {
    prices: [],
    timestamps: [],
    period: '',
    lastUpdated: 0,
  };

  // Prepare chart data
  const chartData = {
    xAxis: [
      {
        data: currentHistory.timestamps,
        scaleType: 'time' as const, // Change this from a generic string to 'time'
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
            {coin.name} ({coin.symbol.toUpperCase()})
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
          <Box mb={2}>
            <FormControl size="small">
              <InputLabel>Time Period</InputLabel>
              <Select
                value={period}
                label="Time Period"
                onChange={(e) => setPeriod(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box height={400}>
            {currentHistory.prices.length > 0 ? (
              <LineChart
                xAxis={chartData.xAxis}
                series={chartData.series}
                height={400}
              />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};
