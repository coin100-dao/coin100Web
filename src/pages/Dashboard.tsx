// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { useAppDispatch } from '../store/hooks';
import { fetchTotalMarketCap } from '../store/slices/coin100Slice';
import { TotalMarketCap } from '../components/dashboard';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initial fetch
    const endTime = new Date().toISOString(); // Current time in ISO format
    const startTime = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago

    dispatch(fetchTotalMarketCap({ start: startTime, end: endTime }));

    // Set up periodic refresh
    const interval = setInterval(() => {
      const endTime = new Date().toISOString(); // Current time in ISO format
      const startTime = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago

      dispatch(fetchTotalMarketCap({ start: startTime, end: endTime }));
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: { xs: 'auto', sm: 'calc(100vh - 64px)' },
        p: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 2 },
        overflow: { xs: 'auto', sm: 'hidden' },
      }}
    >
      {/* Top Section */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ height: '100%' }}>
          {/* Market Cap Chart */}
          <Grid item xs={12} sm={12} md={9.6}>
            <TotalMarketCap />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
