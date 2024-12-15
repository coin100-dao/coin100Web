// ICO.tsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  Box,
  Container,
  Grid,
  useTheme,
  Stack,
  Typography,
  LinearProgress,
  Paper,
} from '@mui/material';
import { fetchAllData } from '../store/slices/web3Slice';
import BuySection from '../components/ico/BuySection';
import SaleInfo from '../components/ico/SaleInfo';
import Stats from '../components/ico/Stats';
import FAQ from '../components/ico/FAQ';
import { formatDistanceToNow } from 'date-fns';

const ICO: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const {
    walletAddress,
    icoStartTime,
    icoEndTime,
    polRate,
    isFinalized,
    totalSold,
    remainingTokens,
    isIcoActive,
    loading,
  } = useSelector((state: RootState) => state.web3);

  useEffect(() => {
    if (walletAddress) {
      dispatch(fetchAllData());
      const interval = setInterval(() => {
        dispatch(fetchAllData());
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [dispatch, walletAddress]);

  const totalSupply = parseFloat(totalSold) + parseFloat(remainingTokens);
  const progress = (parseFloat(totalSold) / totalSupply) * 100;
  const timeLeft = icoEndTime * 1000 - Date.now();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 6,
        background: theme.palette.background.default,
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box mb={6} textAlign="center">
          <Typography variant="h2" gutterBottom>
            COIN100 Presale
          </Typography>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Your Gateway to the Top 100 Cryptocurrencies
          </Typography>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Box>

        <Grid container spacing={4}>
          {/* Sale Progress */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Sale Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 20, borderRadius: 2, mb: 2 }}
              />
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {totalSold} C100 Sold
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {remainingTokens} C100 Remaining
                  </Typography>
                </Grid>
              </Grid>
              {isIcoActive && timeLeft > 0 && (
                <Typography variant="subtitle1" textAlign="center" mt={2}>
                  {formatDistanceToNow(icoEndTime * 1000, { addSuffix: true })}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Left Section - Buy */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <BuySection />
              <Stats />
            </Stack>
          </Grid>

          {/* Right Section - Info */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <SaleInfo
                polRate={polRate}
                isActive={isIcoActive}
                isFinalized={isFinalized}
                startTime={icoStartTime}
                endTime={icoEndTime}
              />
              <FAQ />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ICO;
