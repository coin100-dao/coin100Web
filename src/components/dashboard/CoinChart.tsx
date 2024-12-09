// src/components/dashboard/CoinChart.tsx
import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { Line } from 'react-chartjs-2';
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
  TooltipItem,
  Filler,
  ChartType,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCoinBySymbol } from '../../store/slices/coin100Slice';
import { convertPeriodToDates } from '../../utils/dateUtils';
import { TimePeriod } from '../../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

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
  const selectedCoin = useAppSelector((state) => state.coin100.selectedCoin);
  const coinHistory = useAppSelector((state) => state.coin100.coinHistory);
  const loadingSymbols = useAppSelector(
    (state) => state.coin100.loadingSymbols
  );

  useEffect(() => {
    if (selectedCoin?.symbol) {
      const { start, end } = convertPeriodToDates(selectedPeriod.value);
      dispatch(
        fetchCoinBySymbol({
          symbol: selectedCoin.symbol,
          start,
          end,
        })
      );
    }
  }, [selectedCoin?.symbol, selectedPeriod, dispatch]);

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
          <Line data={barData} options={options} />
        </Box>
      </Box>
    );
  };

  // Safely handle price_change_percentage_24h
  const priceChange = selectedCoin
    ? Number(selectedCoin.price_change_percentage_24h) || 0
    : 0;

  return (
    <Box
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
            <Box
              sx={{
                backgroundColor: getPriceChangeColor(priceChange),
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {priceChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {priceChange.toFixed(2)}%
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {TIME_PERIODS.map((period) => (
              <Box
                key={period.value}
                sx={{
                  backgroundColor:
                    selectedPeriod.value === period.value
                      ? theme.palette.primary.main
                      : 'transparent',
                  color:
                    selectedPeriod.value === period.value
                      ? 'white'
                      : theme.palette.text.primary,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => handlePeriodChange(period)}
              >
                {period.label}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {renderChartContent()}
    </Box>
  );
};

export default CoinChart;
