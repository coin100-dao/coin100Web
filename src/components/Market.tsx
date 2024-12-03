// src/components/Market.tsx

import React, { useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  useTheme,
  Alert,
  IconButton,
} from '@mui/material';
import { TrendingUp, TrendingDown, Refresh } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTopCoins,
  fetchCoinDetails,
} from '../store/slices/coingeckoSlice';
import { RootState } from '../store/store';
import CoinDetails from './CoinDetails';

const Market: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { topCoins, coinDetails, loading, error } = useAppSelector(
    (state: RootState) => state.coingecko
  );
  const [selectedCoinId, setSelectedCoinId] = React.useState<string | null>(
    null
  );

  const loadData = useCallback(() => {
    dispatch(fetchTopCoins());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedCoinId) {
      dispatch(fetchCoinDetails(selectedCoinId));
    }
  }, [selectedCoinId, dispatch]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ flex: 1 }}>
          Top Cryptocurrencies
        </Typography>
        <IconButton
          onClick={loadData}
          disabled={loading}
          sx={{
            transition: 'transform 0.2s',
            ...(loading && {
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }),
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {error && topCoins.length === 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {error && topCoins.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Using cached data. {error}
        </Alert>
      )}

      {loading && topCoins.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={2}>
        {topCoins.map((coin) => (
          <Grid item xs={12} sm={6} md={4} key={coin.id}>
            <Card
              onClick={() => setSelectedCoinId(coin.id)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                },
                bgcolor:
                  selectedCoinId === coin.id
                    ? theme.palette.mode === 'dark'
                      ? 'grey.800'
                      : 'grey.100'
                    : 'background.paper',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mr: 2 }}
                    >
                      #{coin.market_cap_rank}
                    </Typography>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      style={{
                        width: 30,
                        height: 30,
                        marginRight: theme.spacing(1),
                        filter: loading ? 'grayscale(100%)' : 'none',
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1" component="div">
                        {coin.symbol.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {coin.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={
                      coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp />
                      ) : (
                        <TrendingDown />
                      )
                    }
                    label={`${coin.price_change_percentage_24h?.toFixed(2)}%`}
                    color={
                      coin.price_change_percentage_24h >= 0
                        ? 'success'
                        : 'error'
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ${formatPrice(coin.current_price)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Vol: ${(coin.total_volume / 1e6).toFixed(2)}M
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  MCap: ${(coin.market_cap / 1e9).toFixed(2)}B
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedCoinId && coinDetails && (
        <Box sx={{ mt: 4 }}>
          <CoinDetails coin={coinDetails} />
        </Box>
      )}
    </Box>
  );
};

export default Market;
