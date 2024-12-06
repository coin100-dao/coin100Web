import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  useTheme,
  Chip,
  Grid,
} from '@mui/material';
import { TrendingUp, TrendingDown, CompareArrows } from '@mui/icons-material';
import { CoinData } from '../../services/api';
import { formatNumber, formatPercentage } from '../../utils/general';

interface CoinCardProps {
  coin: CoinData;
  onClick: () => void;
  onCompare: () => void;
}

export const CoinCard: React.FC<CoinCardProps> = ({
  coin,
  onClick,
  onCompare,
}) => {
  const theme = useTheme();

  // Add null check for the entire coin object
  if (!coin) {
    return null;
  }

  // console.log('CoinCard raw coin data:', {
  //   price_change_percentage_24h: coin.price_change_percentage_24h,
  //   type: typeof coin.price_change_percentage_24h,
  //   current_price: coin.current_price,
  //   market_cap: coin.market_cap,
  //   total_volume: coin.total_volume
  // });

  // Ensure numeric values are valid numbers
  const currentPrice =
    typeof coin.current_price === 'string'
      ? parseFloat(coin.current_price)
      : coin.current_price;
  const marketCap =
    typeof coin.market_cap === 'string'
      ? parseFloat(coin.market_cap)
      : coin.market_cap;
  const totalVolume =
    typeof coin.total_volume === 'string'
      ? parseFloat(coin.total_volume)
      : coin.total_volume;
  const priceChange =
    typeof coin.price_change_percentage_24h === 'string'
      ? parseFloat(coin.price_change_percentage_24h)
      : (coin.price_change_percentage_24h ?? 0);

  // console.log('CoinCard processed values:', {
  //   currentPrice,
  //   marketCap,
  //   totalVolume,
  //   priceChange,
  //   priceChangeType: typeof priceChange
  // });

  const isPositive = priceChange > 0;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: '100%',
        background: theme.palette.background.paper,
        borderRadius: 2,
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Box onClick={onClick}>
          <Typography variant="h6" fontWeight="bold">
            {coin.name || 'Unknown'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {coin.symbol?.toUpperCase() || 'N/A'}
          </Typography>
        </Box>
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onCompare();
            }}
          >
            <CompareArrows />
          </IconButton>
        </Box>
      </Box>

      <Box onClick={onClick}>
        <Typography variant="h5" fontWeight="bold" mb={1}>
          ${formatNumber(currentPrice)}
        </Typography>
        <Chip
          icon={isPositive ? <TrendingUp /> : <TrendingDown />}
          label={formatPercentage(priceChange)}
          color={isPositive ? 'success' : 'error'}
          size="small"
          sx={{ mb: 2 }}
        />
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Market Cap
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              ${formatNumber(marketCap)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              24h Volume
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              ${formatNumber(totalVolume)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
