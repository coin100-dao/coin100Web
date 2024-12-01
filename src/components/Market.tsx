// src/components/Market.tsx

import React, { useEffect } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTopCoins,
  fetchCoinDetails,
} from '../store/slices/coingeckoSlice';
import { RootState } from '../store/store';
import CoinDetails from './CoinDetails';

const Market: React.FC = () => {
  const dispatch = useAppDispatch();
  const { topCoins, coinDetails, loading, error } = useAppSelector(
    (state: RootState) => state.coingecko
  );
  const [selectedCoinId, setSelectedCoinId] = React.useState<string | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchTopCoins());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCoinId) {
      dispatch(fetchCoinDetails(selectedCoinId));
    }
  }, [selectedCoinId, dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left Side: List of Coins */}
      <Box sx={{ width: '30%', maxHeight: '80vh', overflowY: 'auto' }}>
        <List>
          {topCoins.map((coin) => (
            <ListItemButton
              key={coin.id}
              selected={selectedCoinId === coin.id}
              onClick={() => setSelectedCoinId(coin.id)}
            >
              <ListItemText
                primary={`${coin.market_cap_rank}. ${coin.name}`}
                secondary={`$${coin.current_price.toLocaleString()}`}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Right Side: Coin Details */}
      <Box sx={{ flex: 1, p: 2 }}>
        {selectedCoinId && coinDetails ? (
          <CoinDetails coin={coinDetails} />
        ) : (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Select a coin to view details
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Market;
