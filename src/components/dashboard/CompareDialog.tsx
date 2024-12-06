import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  Chip,
} from '@mui/material';
import { Close, TrendingUp, TrendingDown } from '@mui/icons-material';
import { CoinData } from '../../services/api';
import { formatNumber, formatPercentage } from '../../utils/general';

interface CompareDialogProps {
  coins: CoinData[];
  open: boolean;
  onClose: () => void;
}

export const CompareDialog: React.FC<CompareDialogProps> = ({
  coins,
  open,
  onClose,
}) => {
  if (coins.length !== 2) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div">
            Compare Coins
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
          {coins.map((coin) => {
            const priceChange = coin.price_change_percentage_24h ?? 0;
            const isPositive = priceChange > 0;

            return (
              <Grid item xs={12} md={6} key={coin.id}>
                <Box mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${formatNumber(coin.current_price)}
                  </Typography>
                  <Chip
                    icon={isPositive ? <TrendingUp /> : <TrendingDown />}
                    label={formatPercentage(priceChange)}
                    color={isPositive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography color="text.secondary">Market Cap</Typography>
                    <Typography variant="h6">
                      ${formatNumber(coin.market_cap)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color="text.secondary">24h Volume</Typography>
                    <Typography variant="h6">
                      ${formatNumber(coin.total_volume)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color="text.secondary">24h High</Typography>
                    <Typography variant="h6">
                      ${formatNumber(coin.high_24h)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color="text.secondary">24h Low</Typography>
                    <Typography variant="h6">
                      ${formatNumber(coin.low_24h)}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
