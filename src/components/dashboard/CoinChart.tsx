import React, { useEffect, useState } from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
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
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCoinBySymbol } from '../../store/slices/coin100Slice';
import { CoinData } from '../../services/api';

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

interface TimePeriod {
  label: string;
  value: string;
  unit: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

const TIME_PERIODS: TimePeriod[] = [
  { label: '5m', value: '5m', unit: 'minute' },
  { label: '1h', value: '1h', unit: 'hour' },
  { label: '1d', value: '1d', unit: 'day' },
  { label: '1w', value: '1w', unit: 'week' },
  { label: '1m', value: '1m', unit: 'month' },
];

interface CoinChartProps {
  selectedCoin: CoinData | null;
}

const CoinChart: React.FC<CoinChartProps> = ({ selectedCoin }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TIME_PERIODS[0]
  );
  const { coinHistory, loadingSymbols } = useAppSelector(
    (state) => state.coin100
  );

  useEffect(() => {
    if (selectedCoin) {
      const fetchData = () => {
        dispatch(
          fetchCoinBySymbol({
            symbol: selectedCoin.symbol,
            period: selectedPeriod.value,
          })
        );
      };

      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, selectedCoin, selectedPeriod]);

  if (!selectedCoin) {
    return (
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      >
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          Select a coin to view its chart
        </Typography>
      </Paper>
    );
  }

  const isLoading = loadingSymbols[selectedCoin.symbol];
  const historyData = coinHistory[selectedCoin.symbol];

  // Show loading state
  if (isLoading) {
    return (
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  const chartData =
    historyData && historyData.timestamps.length > 0
      ? {
          labels: historyData.timestamps.map((ts) => new Date(ts)),
          datasets: [
            {
              label: `${selectedCoin.symbol.toUpperCase()} Price (USD)`,
              data: historyData.timestamps.map((ts, index) => ({
                x: new Date(ts),
                y: historyData.prices[index],
              })),
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.primary.light,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: isMobile ? 1 : 3,
            },
          ],
        }
      : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: !isMobile,
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y;
            return `$${value.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: selectedPeriod.unit,
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy',
          },
        },
        grid: {
          display: !isMobile,
        },
        ticks: {
          maxRotation: isMobile ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 6 : 12,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          display: !isMobile,
        },
        ticks: {
          callback: function (this: unknown, value: number | string) {
            if (typeof value === 'number') {
              return `$${value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}`;
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img
            src={selectedCoin.image}
            alt={selectedCoin.name}
            style={{ width: 24, height: 24 }}
          />
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            {selectedCoin.name}
          </Typography>
        </Box>
        <ButtonGroup variant="outlined" size={isMobile ? 'small' : 'medium'}>
          {TIME_PERIODS.map((period) => (
            <Button
              key={period.value}
              onClick={() => setSelectedPeriod(period)}
              variant={
                selectedPeriod.value === period.value ? 'contained' : 'outlined'
              }
            >
              {period.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: '300px',
          width: '100%',
          position: 'relative',
        }}
      >
        {chartData && <Line data={chartData} options={chartOptions} />}
        {!chartData && !isLoading && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography color="text.secondary">
              No price data available for {selectedCoin.symbol.toUpperCase()}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CoinChart;
