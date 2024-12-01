// src/components/Coin100.tsx

import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { RootState } from '../store/store';
import { fetchTopCoins } from '../store/slices/coingeckoSlice';
import { fetchTokenBalance } from '../store/slices/web3Slice';

const Coin100: React.FC = () => {
  const dispatch = useAppDispatch();
  const { totalMarketCap, loading: coingeckoLoading } = useAppSelector(
    (state: RootState) => state.coingecko
  );
  const {
    tokenBalance,
    loading: web3Loading,
    walletAddress,
  } = useAppSelector((state: RootState) => state.web3);

  useEffect(() => {
    dispatch(fetchTopCoins());
  }, [dispatch]);

  useEffect(() => {
    if (walletAddress) {
      dispatch(fetchTokenBalance({ walletAddress })).unwrap();
    }
  }, [dispatch, walletAddress]);

  if (coingeckoLoading || web3Loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5">Your COIN100 Balance</Typography>
      <Typography variant="h3" sx={{ mt: 2 }}>
        {tokenBalance || 0} COIN100
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Total Market Cap of Top 100 Coins</Typography>
        <Typography variant="h3" sx={{ mt: 2 }}>
          ${totalMarketCap.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Coin100;
