import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  Stack,
} from '@mui/material';
import { AccountBalanceWallet, ShoppingCart } from '@mui/icons-material';
import {
  buyTokensWithPOL,
  fetchTokenBalance,
  fetchICOData,
} from '../../store/slices/web3Slice';

const BuySection: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { walletAddress, polRate, loading } = useSelector(
    (state: RootState) => state.web3
  );
  const [polAmount, setPolAmount] = useState<string>('');
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buySuccess, setBuySuccess] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!polAmount || isNaN(Number(polAmount)) || Number(polAmount) <= 0) {
      setBuyError('Please enter a valid POL amount.');
      return;
    }
    try {
      setBuyError(null);
      setBuySuccess(null);
      await dispatch(buyTokensWithPOL({ amount: polAmount })).unwrap();
      setBuySuccess(
        `Successfully purchased ${(
          Number(polAmount) * Number(polRate || '0')
        ).toFixed(2)} C100 tokens.`
      );
      setPolAmount('');
      // Refresh token balance and ICO data after purchase
      if (walletAddress) {
        await dispatch(fetchTokenBalance({ walletAddress })).unwrap();
        await dispatch(fetchICOData()).unwrap();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to buy tokens.';
      setBuyError(errorMessage);
    }
  };

  const expectedTokens = (Number(polAmount) * Number(polRate || '0')).toFixed(
    2
  );

  return (
    <Card
      sx={{
        height: '100%',
        background: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Buy COIN100 Tokens
          </Typography>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Current Rate: 1 POL = {polRate || '0'} C100
            </Typography>
            <TextField
              fullWidth
              label="POL Amount"
              variant="outlined"
              value={polAmount}
              onChange={(e) => setPolAmount(e.target.value)}
              type="number"
              InputProps={{
                startAdornment: (
                  <AccountBalanceWallet
                    sx={{ color: 'action.active', mr: 1 }}
                  />
                ),
              }}
              sx={{ mt: 2 }}
            />
            {polAmount && (
              <Typography
                variant="body2"
                sx={{ mt: 1, color: 'text.secondary' }}
              >
                You will receive: {expectedTokens} C100
              </Typography>
            )}
          </Box>

          {buyError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {buyError}
            </Alert>
          )}
          {buySuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {buySuccess}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={handleBuy}
            disabled={!walletAddress || loading}
            startIcon={
              loading ? <CircularProgress size={20} /> : <ShoppingCart />
            }
            sx={{
              py: 2,
              background: theme.palette.primary.main,
              '&:hover': {
                background: theme.palette.primary.dark,
              },
            }}
          >
            {loading ? 'Processing...' : 'Buy Now'}
          </Button>

          {!walletAddress && (
            <Alert severity="info">
              Please connect your wallet to participate in the ICO
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BuySection;
