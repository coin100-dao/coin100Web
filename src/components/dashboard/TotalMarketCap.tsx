import React, { useEffect, useState } from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Typography,
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
import { fetchTotalMarketCap } from '../../store/slices/coin100Slice';
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
  { label: '1h', value: '1h', unit: 'hour' },
  { label: '1d', value: '1d', unit: 'day' },
  { label: '1w', value: '1w', unit: 'week' },
  { label: '1m', value: '1m', unit: 'month' },
];

const TotalMarketCap: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    TIME_PERIODS[0]
  );
  const { totalMarketCapData, loadingTotalMarketCap } = useAppSelector(
    (state) => state.coin100
  );

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setSelectedPeriod(newPeriod);
    const { start, end } = convertPeriodToDates(newPeriod.value);
    dispatch(fetchTotalMarketCap({ start, end }));
  };

  useEffect(() => {
    const { start, end } = convertPeriodToDates(selectedPeriod.value);
    dispatch(fetchTotalMarketCap({ start, end }));

    const interval = setInterval(() => {
      const { start, end } = convertPeriodToDates(selectedPeriod.value);
      dispatch(fetchTotalMarketCap({ start, end }));
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedPeriod, dispatch]);

  // Early return for loading state
  if (loadingTotalMarketCap) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Only create chart data if we have data points
  const chartData =
    totalMarketCapData && totalMarketCapData.length > 0
      ? {
          labels: totalMarketCapData.map((data) => new Date(data.timestamp)),
          datasets: [
            {
              label: 'Total Market Cap (USD)',
              data: totalMarketCapData.map((data) => ({
                x: new Date(data.timestamp),
                y: parseFloat(data.total_market_cap),
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
            return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
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
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`;
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
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
        <Typography variant="h6" component="h2">
          Total Market Cap
        </Typography>
        <ButtonGroup variant="outlined" size={isMobile ? 'small' : 'medium'}>
          {TIME_PERIODS.map((period) => (
            <Button
              key={period.value}
              onClick={() => handlePeriodChange(period)}
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
        {!chartData && !loadingTotalMarketCap && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TotalMarketCap;
