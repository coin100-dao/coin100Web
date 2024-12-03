// src/components/Coin100.tsx

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useTheme,
} from '@mui/material';
import { AccountBalanceWallet, ShowChart } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { RootState } from '../store/store';
import { fetchTopCoins } from '../store/slices/coingeckoSlice';
import { fetchTokenBalance } from '../store/slices/web3Slice';

const Coin100: React.FC = () => {
  const theme = useTheme();
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
      <Typography variant="h4" gutterBottom>
        Your Portfolio
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card
            sx={{
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'primary.dark'
                  : 'primary.light',
              color: theme.palette.primary.contrastText,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWallet sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">COIN100 Balance</Typography>
                  <Typography variant="h3">{tokenBalance || 0}</Typography>
                </Box>
              </Box>
              {!walletAddress && (
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  Connect your wallet to view your balance
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card
            sx={{
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'secondary.dark'
                  : 'secondary.light',
              color: theme.palette.secondary.contrastText,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShowChart sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Total Market Cap</Typography>
                  <Typography variant="h3">
                    ${(totalMarketCap / 1e9).toFixed(2)}B
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Total market cap of top 100 coins
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Coin100;
