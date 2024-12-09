// src/components/dashboard/CoinChart.tsx
import React, { useEffect, useState, FC } from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  BarElement,
  TooltipItem,
  ChartType,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCoinBySymbol } from '../../store/slices/coin100Slice';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface TimePeriod {
  label: string;
  value: string;
  unit: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

const TIME_PERIODS: TimePeriod[] = [
  { label: '5m', value: '5m', unit: 'minute' },
  { label: '15m', value: '15m', unit: 'minute' },
  { label: '1h', value: '1h', unit: 'hour' },
  { label: '4h', value: '4h', unit: 'hour' },
  { label: '1d', value: '1d', unit: 'day' },
  { label: '1w', value: '1w', unit: 'week' },
];

interface CoinChartProps {
  height?: number | string;
}

const DEFAULT_PERIOD: TimePeriod = { label: '1w', value: '1w', unit: 'week' };

const CoinChart: FC<CoinChartProps> = ({ height }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedPeriod, setSelectedPeriod] =
    useState<TimePeriod>(DEFAULT_PERIOD);

  const { selectedCoin, coinHistory, loadingSymbols } = useAppSelector(
    (state) => state.coin100
  );

  useEffect(() => {
    if (!selectedCoin || !selectedCoin.symbol) {
      return; // Don't fetch if there's no selected coin or symbol is missing
    }

    dispatch(
      fetchCoinBySymbol({
        symbol: selectedCoin.symbol,
        period: selectedPeriod.value,
      })
    );

    const interval = setInterval(() => {
      if (selectedCoin && selectedCoin.symbol) {
        dispatch(
          fetchCoinBySymbol({
            symbol: selectedCoin.symbol,
            period: selectedPeriod.value,
          })
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedCoin, selectedPeriod, dispatch]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  const loading = selectedCoin ? loadingSymbols[selectedCoin.symbol] : false;
  const history = selectedCoin ? coinHistory[selectedCoin.symbol] : null;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: selectedPeriod.unit,
        },
        grid: {
          display: false,
        },
      },
      price: {
        type: 'linear' as const,
        position: 'left' as const,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          callback: function (value: number | string) {
            const numValue =
              typeof value === 'string' ? parseFloat(value) : value;
            return `$${numValue.toLocaleString()}`;
          },
        },
      },
      volume: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: {
          display: false,
        },
        ticks: {
          callback: function (value: number | string) {
            const numValue =
              typeof value === 'string' ? parseFloat(value) : value;
            return `${(numValue / 1_000_000).toFixed(1)}M`;
          },
        },
      },
    },
    plugins: {
      legend: {
        display: !isMobile,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<ChartType>) {
            if (context.dataset.yAxisID === 'price') {
              return `Price: $${context.parsed.y.toLocaleString()}`;
            }
            return `Volume: ${(context.parsed.y / 1_000_000).toFixed(1)}M`;
          },
        },
      },
    },
  };

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? theme.palette.success.main : theme.palette.error.main;
  };

  const renderChartContent = () => {
    if (!selectedCoin) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" color="textSecondary">
            Select a coin to view its chart
          </Typography>
        </Box>
      );
    }

    if (loading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!history || history.timestamps.length === 0) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" color="textSecondary">
            No historical data available
          </Typography>
        </Box>
      );
    }

    const lineData = {
      labels: history.timestamps.map((ts) => new Date(ts)),
      datasets: [
        {
          label: 'Price',
          data: history.prices,
          borderColor: theme.palette.primary.main,
          backgroundColor: (context: {
            chart: { ctx: CanvasRenderingContext2D };
          }) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, `${theme.palette.primary.main}33`);
            gradient.addColorStop(1, `${theme.palette.primary.main}00`);
            return gradient;
          },
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: 'price',
        },
      ],
    };

    const barData = {
      labels: history.timestamps.map((ts) => new Date(ts)),
      datasets: [
        {
          label: 'Volume',
          data: history.volumes,
          backgroundColor: theme.palette.secondary.main,
          yAxisID: 'volume',
        },
      ],
    };

    // Render line chart (price)
    // Then render bar chart (volume) below or above it depending on your design
    // If you want them combined on the same chart as overlays, consider using a single chart with multiple datasets.
    // Below is a simple example using two separate charts stacked vertically.

    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Line data={lineData} options={options} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Bar data={barData} options={options} />
        </Box>
      </Box>
    );
  };

  // Safely handle price_change_percentage_24h
  const priceChange = selectedCoin
    ? Number(selectedCoin.price_change_percentage_24h) || 0
    : 0;

  return (
    <Paper
      elevation={3}
      sx={{
        height: height || '100%',
        p: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {selectedCoin && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedCoin.image && (
              <img
                src={selectedCoin.image}
                alt={selectedCoin.name || 'Coin'}
                style={{ width: 32, height: 32 }}
              />
            )}
            <Typography variant="h6">
              {selectedCoin.name} (
              {selectedCoin.symbol ? selectedCoin.symbol.toUpperCase() : ''})
            </Typography>
            <Chip
              icon={
                priceChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />
              }
              label={`${priceChange.toFixed(2)}%`}
              sx={{
                backgroundColor: getPriceChangeColor(priceChange),
                color: 'white',
              }}
            />
          </Box>
          <ButtonGroup
            size={isMobile ? 'small' : 'medium'}
            sx={{ flexWrap: 'wrap' }}
          >
            {TIME_PERIODS.map((period) => (
              <Button
                key={period.value}
                variant={
                  selectedPeriod.value === period.value
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() => handlePeriodChange(period)}
              >
                {period.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      )}
      {renderChartContent()}
    </Paper>
  );
};

export default CoinChart;
