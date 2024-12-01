// src/pages/Dashboard.tsx

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { RootState } from '../store/store';

const Dashboard: React.FC = () => {
  const { walletAddress, tokenBalance, loading } = useAppSelector(
    (state: RootState) => state.web3
  );

  if (!walletAddress) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Typography variant="h5">
          Please connect your wallet to view the dashboard
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Wallet Address
              </Typography>
              <Typography
                variant="h6"
                component="div"
                sx={{ wordBreak: 'break-all' }}
              >
                {walletAddress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                COIN100 Balance
              </Typography>
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <Typography variant="h6">{tokenBalance || '0'} C100</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
