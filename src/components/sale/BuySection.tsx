import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  buyTokensWithUSDC,
  calculateC100Amount,
} from '../../store/slices/publicSaleSlice';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  useTheme,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Info } from '@mui/icons-material';

const BuySection: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [usdcAmount, setUsdcAmount] = useState<string>('');
  const [c100Amount, setC100Amount] = useState<string>('0');
  const [error, setError] = useState<string>('');

  const {
    loading,
    error: saleError,
    isSaleActive,
    isPaused,
  } = useSelector((state: RootState) => state.publicSale);

  const { walletAddress, balance: usdcBalance } = useSelector(
    (state: RootState) => state.web3
  );

  useEffect(() => {
    if (usdcAmount) {
      try {
        const amount = calculateC100Amount(usdcAmount);
        setC100Amount(amount);
        setError('');
      } catch {
        setError('Invalid USDC amount');
        setC100Amount('0');
      }
    } else {
      setC100Amount('0');
    }
  }, [usdcAmount]);

  const handleBuy = async () => {
    if (!usdcAmount) return;

    try {
      await dispatch(buyTokensWithUSDC(usdcAmount)).unwrap();
      setUsdcAmount('');
      setC100Amount('0');
    } catch (error: unknown) {
      console.error('Failed to buy tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to buy tokens');
    }
  };

  const isDisabled =
    !walletAddress ||
    !isSaleActive ||
    isPaused ||
    !usdcAmount ||
    Number(usdcAmount) <= 0 ||
    Number(usdcAmount) > Number(usdcBalance);

  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper}80 0%, ${theme.palette.background.paper}40 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.primary.dark}40`,
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Buy C100 Tokens
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Your USDC Balance: {Number(usdcBalance).toFixed(2)} USDC
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Rate: 1 C100 = 0.001 USDC
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="USDC Amount"
            value={usdcAmount}
            onChange={(e) => setUsdcAmount(e.target.value)}
            type="number"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Enter the amount of USDC you want to spend">
                    <Info color="action" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            disabled={!isSaleActive || isPaused}
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="C100 Amount to Receive"
            value={c100Amount}
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="This is the amount of C100 tokens you will receive">
                    <Info color="action" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {saleError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saleError}
          </Alert>
        )}

        {!walletAddress ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please connect your wallet to buy tokens
          </Alert>
        ) : !isSaleActive ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Sale is not active
          </Alert>
        ) : isPaused ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Sale is currently paused
          </Alert>
        ) : null}

        <LoadingButton
          variant="contained"
          fullWidth
          size="large"
          onClick={handleBuy}
          loading={loading}
          disabled={isDisabled}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }}
        >
          {loading
            ? 'Processing...'
            : !walletAddress
              ? 'Connect Wallet'
              : 'Buy C100 Tokens'}
        </LoadingButton>
      </CardContent>
    </Card>
  );
};

export default BuySection;
