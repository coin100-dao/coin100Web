import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  calculateC100Amount,
  selectToken,
  checkUsdcAllowance,
  approveUsdcSpending,
  buyC100Tokens,
  resetPurchaseState,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Link,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Button,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Info,
  AccountBalanceWallet,
  CheckCircle,
  Error as ErrorIcon,
  Pending,
  ArrowForward,
  Warning,
} from '@mui/icons-material';

interface TransactionStatus {
  status: 'pending' | 'success' | 'error' | 'waiting';
  message: string;
  hash?: string;
}

const BuySection: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [c100Amount, setC100Amount] = useState<string>('0');
  const [error, setError] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);
  const [approvalStatus, setApprovalStatus] = useState<TransactionStatus>({
    status: 'waiting',
    message: 'Waiting to start',
  });
  const [purchaseStatus, setPurchaseStatus] = useState<TransactionStatus>({
    status: 'waiting',
    message: 'Waiting for approval',
  });

  const {
    error: saleError,
    isSaleActive,
    isPaused,
    walletAddress,
    allowedTokens,
    selectedToken,
    purchaseState,
  } = useSelector((state: RootState) => state.publicSale);

  useEffect(() => {
    if (tokenAmount && selectedToken?.rate) {
      try {
        const amount = calculateC100Amount(tokenAmount, selectedToken.rate);
        setC100Amount(amount);
        setError('');
      } catch {
        setError('Invalid amount');
        setC100Amount('0');
      }
    } else {
      setC100Amount('0');
    }
  }, [tokenAmount, selectedToken]);

  useEffect(() => {
    // Reset purchase state when component unmounts
    return () => {
      dispatch(resetPurchaseState());
    };
  }, [dispatch]);

  useEffect(() => {
    // Update transaction statuses based on purchase state
    if (purchaseState.isApproving) {
      setApprovalStatus({
        status: 'pending',
        message: 'Waiting for approval confirmation in MetaMask...',
      });
      setPurchaseStatus({
        status: 'waiting',
        message: 'Waiting for approval to complete',
      });
    } else if (purchaseState.approvalHash) {
      setApprovalStatus({
        status: 'success',
        message: 'Token approval confirmed!',
        hash: purchaseState.approvalHash,
      });
      setPurchaseStatus({
        status: 'waiting',
        message: 'Ready to purchase',
      });
    } else if (purchaseState.approvalError) {
      setApprovalStatus({
        status: 'error',
        message: purchaseState.approvalError,
      });
    }

    if (purchaseState.isBuying) {
      setPurchaseStatus({
        status: 'pending',
        message: 'Waiting for purchase confirmation in MetaMask...',
      });
    } else if (purchaseState.purchaseHash) {
      setPurchaseStatus({
        status: 'success',
        message: 'Purchase successful!',
        hash: purchaseState.purchaseHash,
      });
    } else if (purchaseState.purchaseError) {
      setPurchaseStatus({
        status: 'error',
        message: purchaseState.purchaseError,
      });
    }
  }, [purchaseState]);

  const handleTokenChange = (event: SelectChangeEvent<string>) => {
    dispatch(selectToken(event.target.value));
    // Reset statuses when token changes
    setApprovalStatus({
      status: 'waiting',
      message: 'Waiting to start',
    });
    setPurchaseStatus({
      status: 'waiting',
      message: 'Waiting for approval',
    });
  };

  const handleBuy = async () => {
    if (!tokenAmount || !selectedToken) return;

    try {
      setActiveStep(0);
      setApprovalStatus({
        status: 'pending',
        message: 'Checking allowance...',
      });

      // First check allowance
      const allowanceResult = await dispatch(
        checkUsdcAllowance({ usdcAmount: tokenAmount })
      ).unwrap();

      if (!allowanceResult.hasAllowance) {
        // Need to approve first
        await dispatch(
          approveUsdcSpending({ usdcAmount: tokenAmount })
        ).unwrap();
      } else {
        setApprovalStatus({
          status: 'success',
          message: 'Already approved',
        });
      }

      setActiveStep(1);
      // Now buy tokens
      await dispatch(buyC100Tokens({ usdcAmount: tokenAmount })).unwrap();
      setActiveStep(2);

      // Reset form after delay
      setTimeout(() => {
        setTokenAmount('');
        setC100Amount('0');
        setActiveStep(0);
        dispatch(resetPurchaseState());
        setApprovalStatus({
          status: 'waiting',
          message: 'Waiting to start',
        });
        setPurchaseStatus({
          status: 'waiting',
          message: 'Waiting for approval',
        });
      }, 5000);
    } catch (error: unknown) {
      console.error('Failed to process transaction:', error);
      setError(error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  const getStatusIcon = (status: TransactionStatus['status']) => {
    switch (status) {
      case 'pending':
        return <CircularProgress size={20} />;
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'waiting':
        return <Pending color="disabled" />;
    }
  };

  const getStatusChip = (status: TransactionStatus) => (
    <Chip
      icon={getStatusIcon(status.status)}
      label={status.status.toUpperCase()}
      color={
        status.status === 'success'
          ? 'success'
          : status.status === 'error'
            ? 'error'
            : status.status === 'pending'
              ? 'warning'
              : 'default'
      }
      size="small"
    />
  );

  const isDisabled =
    !walletAddress ||
    !isSaleActive ||
    isPaused ||
    !tokenAmount ||
    !selectedToken ||
    Number(tokenAmount) <= 0 ||
    Number(tokenAmount) > Number(selectedToken.balance) ||
    purchaseState.isApproving ||
    purchaseState.isBuying;

  const steps = [
    {
      label: 'Token Approval',
      description: 'Approve the contract to spend your tokens',
      status: approvalStatus,
    },
    {
      label: 'Purchase C100',
      description: 'Complete the purchase of C100 tokens',
      status: purchaseStatus,
    },
    {
      label: 'Complete',
      description: 'Transaction completed successfully',
    },
  ];

  if (!allowedTokens.length) {
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
          <Alert severity="info">
            No payment tokens are currently configured for the sale.
          </Alert>
        </CardContent>
      </Card>
    );
  }

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

        {/* Token Selection and Amount Section */}
        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Payment Token</InputLabel>
            <Select
              value={selectedToken?.address || ''}
              onChange={handleTokenChange}
              label="Select Payment Token"
              disabled={purchaseState.isApproving || purchaseState.isBuying}
            >
              {allowedTokens.map((token) => (
                <MenuItem key={token.address} value={token.address}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccountBalanceWallet />
                    <Box>
                      <Typography variant="body1">
                        {token.name} ({token.symbol})
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Balance: {Number(token.balance).toFixed(4)}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedToken && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                background: theme.palette.background.default,
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Selected Token Details
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Available Balance:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Number(selectedToken.balance).toFixed(4)}{' '}
                    {selectedToken.symbol}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Exchange Rate:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    1 C100 = {Number(selectedToken.rate).toFixed(6)}{' '}
                    {selectedToken.symbol}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Token Amount"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">
                        {selectedToken?.symbol}
                      </Typography>
                      <Tooltip title="Enter the amount of tokens you want to spend">
                        <Info color="action" />
                      </Tooltip>
                    </Stack>
                  </InputAdornment>
                ),
              }}
              disabled={
                !isSaleActive ||
                isPaused ||
                purchaseState.isApproving ||
                purchaseState.isBuying
              }
              error={!!error}
              helperText={error}
              sx={{ mb: 2 }}
            />

            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: theme.palette.background.default,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">You Will Receive:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {Number(c100Amount).toFixed(4)} C100
                </Typography>
              </Stack>
              <ArrowForward color="action" />
            </Paper>
          </Box>
        </Box>

        {/* Transaction Progress Section */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel
                  optional={
                    step.status && (
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mt: 0.5 }}
                      >
                        {getStatusChip(step.status)}
                        <Typography variant="caption" color="textSecondary">
                          {step.status.message}
                        </Typography>
                      </Stack>
                    )
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography>{step.description}</Typography>
                  {step.status?.hash && (
                    <Link
                      href={`https://polygonscan.com/tx/${step.status.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        mt: 1,
                      }}
                    >
                      View on PolygonScan
                      <ArrowForward sx={{ ml: 0.5 }} fontSize="small" />
                    </Link>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Alerts Section */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          {saleError && <Alert severity="error">{saleError}</Alert>}

          {!walletAddress && (
            <Alert
              severity="info"
              icon={<AccountBalanceWallet />}
              action={
                <Button color="inherit" size="small">
                  Connect Wallet
                </Button>
              }
            >
              Please connect your wallet to buy tokens
            </Alert>
          )}

          {!isSaleActive && (
            <Alert severity="warning" icon={<Warning />}>
              Sale is not currently active
            </Alert>
          )}

          {isPaused && (
            <Alert severity="warning" icon={<Warning />}>
              Sale is currently paused
            </Alert>
          )}
        </Stack>

        {/* Action Button */}
        <LoadingButton
          variant="contained"
          fullWidth
          size="large"
          onClick={handleBuy}
          loading={purchaseState.isApproving || purchaseState.isBuying}
          disabled={isDisabled}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            py: 1.5,
          }}
        >
          {purchaseState.isApproving
            ? 'Approving Token...'
            : purchaseState.isBuying
              ? 'Buying C100...'
              : !walletAddress
                ? 'Connect Wallet'
                : activeStep === 2
                  ? 'Purchase Complete!'
                  : 'Buy C100 Tokens'}
        </LoadingButton>
      </CardContent>
    </Card>
  );
};

export default BuySection;
