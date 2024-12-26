import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  useTheme,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import { buyTokensWithPOL } from '../../store/slices/icoSlice';

const BuySection: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [amount, setAmount] = useState('');

  const {
    polRate,
    isIcoActive,
    icoStartTime,
    icoEndTime,
    loading: icoLoading,
    error: icoError,
  } = useSelector((state: RootState) => state.ico);

  const { balance, loading: walletLoading } = useSelector(
    (state: RootState) => state.web3
  );

  const handleBuy = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;

    // Check if user has enough balance
    if (parseFloat(amount) > parseFloat(balance)) {
      return;
    }

    try {
      await dispatch(buyTokensWithPOL(amount)).unwrap();
      setAmount('');
    } catch (error) {
      // Error will be handled by the slice
      console.error('Failed to buy tokens:', error);
    }
  };

  const estimatedTokens = amount
    ? (parseFloat(amount) * parseFloat(polRate)).toFixed(2)
    : '0';
  const now = Math.floor(Date.now() / 1000);
  const saleNotStarted = now < icoStartTime;
  const saleEnded = now > icoEndTime;
  const loading = icoLoading || walletLoading;
  const insufficientBalance = parseFloat(amount) > parseFloat(balance);

  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Buy COIN100 Tokens
        </Typography>

        {icoError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {icoError}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Current Rate: 1 POL (ex MATIC) = {polRate} C100
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Your Balance: {parseFloat(balance).toFixed(4)} POL (ex MATIC)
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Amount in POL (ex MATIC)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">POL (ex MATIC)</InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
          disabled={!isIcoActive || loading}
          error={insufficientBalance}
          helperText={insufficientBalance ? 'Insufficient balance' : ''}
        />

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary">
            You will receive approximately: {estimatedTokens} C100
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleBuy}
          disabled={
            !isIcoActive ||
            loading ||
            !amount ||
            parseFloat(amount) <= 0 ||
            insufficientBalance
          }
          sx={{
            height: 48,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : insufficientBalance ? (
            'Insufficient Balance'
          ) : (
            'Buy Tokens'
          )}
        </Button>

        {!isIcoActive && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {saleNotStarted
              ? 'Sale has not started yet'
              : saleEnded
                ? 'Sale has ended'
                : 'Sale is not currently active'}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BuySection;
