// src/components/sale/BuySection.tsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import {
  approveUsdcSpending,
  buyC100Tokens,
  calculateC100Amount,
  checkVestingSchedule,
  claimVestedTokens,
  checkUsdcAllowance,
  selectToken,
} from '../../store/slices/publicSaleSlice';
import { RootState, AppDispatch } from '../../store/store';

export const BuySection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [amount, setAmount] = useState('');
  const [c100Amount, setC100Amount] = useState('0');
  const [hasAllowance, setHasAllowance] = useState(false);

  const {
    allowedTokens,
    selectedToken,
    purchaseState,
    vestingSchedules,
    loading,
  } = useSelector((state: RootState) => state.publicSale);

  useEffect(() => {
    // Check vesting schedule on component mount
    dispatch(checkVestingSchedule());
  }, [dispatch]);

  useEffect(() => {
    if (selectedToken && amount) {
      const c100 = calculateC100Amount(amount, selectedToken.rate || '0');
      setC100Amount(c100);

      // Check allowance whenever amount or token changes
      dispatch(checkUsdcAllowance({ usdcAmount: amount }))
        .unwrap()
        .then(({ hasAllowance: allowed }) => {
          setHasAllowance(allowed);
        })
        .catch((error) => {
          console.error('Error checking allowance:', error);
          setHasAllowance(false);
        });
    } else {
      setC100Amount('0');
      setHasAllowance(false);
    }
  }, [amount, selectedToken, dispatch]);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleTokenSelect = async (event: SelectChangeEvent<string>) => {
    const tokenAddress = event.target.value;
    try {
      await dispatch(selectToken(tokenAddress)).unwrap();
      setHasAllowance(false); // Reset allowance state when token changes
    } catch (error) {
      console.error('Failed to select token:', error);
      // Optionally, handle the error in the UI (e.g., show an error message)
    }
  };

  const handleApprove = async () => {
    if (!amount) return;
    try {
      await dispatch(approveUsdcSpending({ usdcAmount: amount })).unwrap();
      setHasAllowance(true);
    } catch (error) {
      console.error('Failed to approve:', error);
      setHasAllowance(false);
    }
  };

  const handleBuy = async () => {
    if (!amount) return;
    try {
      await dispatch(buyC100Tokens({ usdcAmount: amount })).unwrap();
      // Refresh vesting schedule after purchase
      dispatch(checkVestingSchedule());
      // Reset states after successful purchase
      setAmount('');
      setC100Amount('0');
      setHasAllowance(false);
    } catch (error) {
      console.error('Failed to buy:', error);
    }
  };

  const handleClaim = async () => {
    try {
      await dispatch(claimVestedTokens()).unwrap();
    } catch (error) {
      console.error('Failed to claim:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isApproveDisabled =
    !amount || purchaseState.isApproving || hasAllowance;
  const isBuyDisabled = !amount || purchaseState.isBuying || !hasAllowance;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Buy C100 Tokens
        </Typography>

        {/* Token Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Token</InputLabel>
          <Select
            value={selectedToken?.address || ''}
            onChange={handleTokenSelect}
            label="Select Token"
          >
            {allowedTokens.map((token) => (
              <MenuItem key={token.address} value={token.address}>
                {token.symbol}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Amount Input */}
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          margin="normal"
          helperText={`You will receive: ${c100Amount} C100`}
        />

        {/* Action Buttons */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleApprove}
            disabled={isApproveDisabled}
            color={hasAllowance ? 'success' : 'primary'}
          >
            {purchaseState.isApproving ? (
              <CircularProgress size={24} />
            ) : hasAllowance ? (
              'Approved'
            ) : (
              'Approve'
            )}
          </Button>
          <Button
            variant="contained"
            onClick={handleBuy}
            disabled={isBuyDisabled}
            color="primary"
          >
            {purchaseState.isBuying ? <CircularProgress size={24} /> : 'Buy'}
          </Button>
        </Box>

        {/* Transaction Status */}
        {purchaseState.approvalHash && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Approval Transaction:{' '}
            <a
              href={`https://polygonscan.com/tx/${purchaseState.approvalHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on PolygonScan
            </a>
          </Alert>
        )}
        {purchaseState.purchaseHash && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Purchase Transaction:{' '}
            <a
              href={`https://polygonscan.com/tx/${purchaseState.purchaseHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on PolygonScan
            </a>
          </Alert>
        )}

        {/* Vesting Schedule Section */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" gutterBottom>
          Your Vesting Schedule
        </Typography>
        {vestingSchedules.length > 0 ? (
          <>
            {vestingSchedules.map((schedule, index) => (
              <Card key={index} sx={{ mt: 2, bgcolor: 'background.paper' }}>
                <CardContent>
                  <Typography variant="body1">
                    Amount: {schedule.amount} C100
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Release Date: {formatDate(schedule.releaseTime)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={
                      schedule.isClaimable ? 'success.main' : 'warning.main'
                    }
                  >
                    Status: {schedule.isClaimable ? 'Claimable' : 'Locked'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleClaim}
                disabled={
                  !vestingSchedules.some((s) => s.isClaimable) || loading
                }
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Claim Available Tokens'
                )}
              </Button>
            </Box>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            You don&apos;t have any vesting schedules yet. When you purchase
            C100 tokens, they will be locked for 12 months before becoming
            claimable.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
