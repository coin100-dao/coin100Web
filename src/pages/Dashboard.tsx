// src/pages/Dashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Autocomplete,
} from '@mui/material';
import {
  CoinCard,
  CoinDetailDialog,
  CompareDialog,
} from '../components/dashboard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAllCoins, fetchCoinBySymbol } from '../store/slices/coin100Slice';
import { CoinData } from '../services/api';

const REFRESH_INTERVAL = 30000; // 30 seconds
const DEFAULT_PERIOD = '5m';

const PERIOD_OPTIONS = [
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
];

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allCoins, loading, selectedCoin } = useAppSelector(
    (state) => state.coin100
  );
  const [selectedCoinData, setSelectedCoinData] = useState<CoinData | null>(
    null
  );
  const [compareCoins, setCompareCoins] = useState<CoinData[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('market_cap');
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

  const fetchData = useCallback(() => {
    dispatch(fetchAllCoins(period));
    if (selectedCoinData) {
      dispatch(fetchCoinBySymbol({ symbol: selectedCoinData.symbol, period }));
    }
  }, [dispatch, period, selectedCoinData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up periodic refresh
  useEffect(() => {
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Update selected coin when Redux state changes
  useEffect(() => {
    if (selectedCoin && selectedCoinData) {
      setSelectedCoinData(selectedCoin);
    }
  }, [selectedCoin]);

  const handleCoinClick = (coin: CoinData) => {
    setSelectedCoinData(coin);
    dispatch(fetchCoinBySymbol({ symbol: coin.symbol, period }));
    setDetailDialogOpen(true);
  };

  const handleCompareClick = (coin: CoinData) => {
    if (
      compareCoins.length < 2 &&
      !compareCoins.find((c) => c.id === coin.id)
    ) {
      setCompareCoins([...compareCoins, coin]);
      dispatch(fetchCoinBySymbol({ symbol: coin.symbol, period }));
      if (compareCoins.length === 1) {
        setCompareDialogOpen(true);
      }
    }
  };

  const handleCloseCompare = () => {
    setCompareDialogOpen(false);
    setCompareCoins([]);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    // Refetch data for the new period
    dispatch(fetchAllCoins(newPeriod));
    if (selectedCoinData) {
      dispatch(
        fetchCoinBySymbol({
          symbol: selectedCoinData.symbol,
          period: newPeriod,
        })
      );
    }
    compareCoins.forEach((coin) => {
      dispatch(fetchCoinBySymbol({ symbol: coin.symbol, period: newPeriod }));
    });
  };

  const sortedCoins = [...allCoins].sort((a, b) => {
    switch (sortBy) {
      case 'market_cap':
        return (b.market_cap ?? 0) - (a.market_cap ?? 0);
      case 'price':
        return (b.current_price ?? 0) - (a.current_price ?? 0);
      case 'volume':
        return (b.total_volume ?? 0) - (a.total_volume ?? 0);
      case 'change':
        return (
          (b.price_change_percentage_24h ?? 0) -
          (a.price_change_percentage_24h ?? 0)
        );
      default:
        return 0;
    }
  });

  const filteredCoins = sortedCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && allCoins.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" gap={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="market_cap">Market Cap</MenuItem>
            <MenuItem value="price">Price</MenuItem>
            <MenuItem value="volume">Volume</MenuItem>
            <MenuItem value="change">24h Change</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Update Period</InputLabel>
          <Select
            value={period}
            label="Update Period"
            onChange={(e) => handlePeriodChange(e.target.value)}
          >
            {PERIOD_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          freeSolo
          options={allCoins.map((coin) => coin.name)}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search coins"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredCoins.map((coin) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={coin.id}>
            <CoinCard
              coin={coin}
              onClick={() => handleCoinClick(coin)}
              onCompare={() => handleCompareClick(coin)}
            />
          </Grid>
        ))}
      </Grid>

      <CoinDetailDialog
        coin={selectedCoinData}
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedCoinData(null);
        }}
      />

      <CompareDialog
        coins={compareCoins}
        open={compareDialogOpen}
        onClose={handleCloseCompare}
      />
    </Box>
  );
};

export default Dashboard;
