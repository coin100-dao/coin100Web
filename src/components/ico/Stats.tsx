import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
}> = ({ title, value, subtitle }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: theme.palette.background.paper,
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div" gutterBottom>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

const Stats: React.FC = () => {
  const theme = useTheme();
  const { totalSold, remainingTokens, polRate, loading } = useSelector(
    (state: RootState) => state.web3
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const totalSupply = parseFloat(totalSold) + parseFloat(remainingTokens);
  const percentageSold = ((parseFloat(totalSold) / totalSupply) * 100).toFixed(
    2
  );
  const polRateValue = parseFloat(polRate).toFixed(2);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        background: theme.palette.background.default,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Sale Statistics
      </Typography>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Total Supply"
            value={`${totalSupply.toLocaleString()} C100`}
            subtitle="Maximum Token Supply"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Tokens Sold"
            value={`${parseFloat(totalSold).toLocaleString()} C100`}
            subtitle={`${percentageSold}% of Total Supply`}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Remaining Tokens"
            value={`${parseFloat(remainingTokens).toLocaleString()} C100`}
            subtitle="Available for Purchase"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Exchange Rate"
            value={`${polRateValue} C100`}
            subtitle="Per 1 POL"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Stats;
