import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  AlertTitle,
  Paper,
  Link,
  CircularProgress,
  useTheme,
  InputLabel,
  InputAdornment,
  Fade,
  Divider,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { LoadingButton } from '@mui/lab';
import { AppDispatch, RootState } from '../../store/store';
import {
  selectToken,
  checkUsdcAllowance,
  approveUsdcSpending,
  buyC100Tokens,
  calculateC100Amount,
  USDCToken,
} from '../../store/slices/publicSaleSlice';
import { connectWallet } from '../../store/slices/walletSlice';
import MetaMaskPopup from '../wallet/MetaMaskPopup';
import {
  AccountBalanceWallet,
  SwapHoriz,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';

export function BuySection() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [c100Amount, setC100Amount] = useState<string>('');
  const [connectDialogOpen, setConnectDialogOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [approvalStatus, setApprovalStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [purchaseStatus, setPurchaseStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [approvalHash, setApprovalHash] = useState<string>('');
  const [purchaseHash, setPurchaseHash] = useState<string>('');
  const [transactionError, setTransactionError] = useState<string>('');

  const {
    allowedTokens,
    selectedToken,
    isSaleActive,
    isPaused,
    loading: publicSaleLoading,
  } = useSelector((state: RootState) => state.publicSale);

  const { isConnected, tokenBalances } = useSelector(
    (state: RootState) => state.wallet
  );

  // Update token balances when they change in wallet state
  useEffect(() => {
    if (allowedTokens.length > 0 && Object.keys(tokenBalances).length > 0) {
      if (selectedToken) {
        const walletBalance = tokenBalances[selectedToken.address]?.balance;
        if (walletBalance && walletBalance !== selectedToken.balance) {
          void dispatch(selectToken(selectedToken.address));
        }
      }
    }
  }, [allowedTokens, tokenBalances, selectedToken, dispatch]);

  // Calculate C100 amount when token amount changes
  useEffect(() => {
    if (selectedToken && tokenAmount) {
      const amount = calculateC100Amount(
        tokenAmount,
        selectedToken.rate || '0'
      );
      setC100Amount(amount);
    } else {
      setC100Amount('');
    }
  }, [tokenAmount, selectedToken]);

  const handleTokenSelect = (event: SelectChangeEvent<string>) => {
    const tokenAddress = event.target.value;
    void dispatch(selectToken(tokenAddress));
    setTokenAmount('');
    setC100Amount('');
    resetTransactionState();
  };

  const handleTokenAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setTokenAmount(value);
      resetTransactionState();
    }
  };

  const resetTransactionState = () => {
    setActiveStep(0);
    setApprovalStatus('idle');
    setPurchaseStatus('idle');
    setApprovalHash('');
    setPurchaseHash('');
    setTransactionError('');
  };

  const handlePurchaseClick = async () => {
    if (!isConnected) {
      setConnectDialogOpen(true);
      return;
    }

    try {
      setTransactionError('');
      setActiveStep(1);

      const allowanceResult = await dispatch(
        checkUsdcAllowance({ usdcAmount: tokenAmount })
      ).unwrap();

      if (!allowanceResult.hasAllowance) {
        setActiveStep(2);
        setApprovalStatus('pending');

        const approvalResult = await dispatch(
          approveUsdcSpending({ usdcAmount: tokenAmount })
        ).unwrap();

        setApprovalHash(approvalResult.transactionHash);
        setApprovalStatus('success');
      }

      setActiveStep(3);
      setPurchaseStatus('pending');

      const purchaseResult = await dispatch(
        buyC100Tokens({ usdcAmount: tokenAmount })
      ).unwrap();

      setPurchaseHash(purchaseResult.transactionHash);
      setPurchaseStatus('success');

      setTimeout(() => {
        setTokenAmount('');
        setC100Amount('');
        resetTransactionState();
      }, 5000);
    } catch (error) {
      console.error('Purchase flow error:', error);
      setTransactionError(
        error instanceof Error ? error.message : 'Transaction failed'
      );
      if (activeStep === 2) {
        setApprovalStatus('error');
      } else if (activeStep === 3) {
        setPurchaseStatus('error');
      }
    }
  };

  const isApprovalRequired = activeStep === 2 && approvalStatus === 'pending';
  const isPurchasePending = activeStep === 3 && purchaseStatus === 'pending';

  const buttonDisabled =
    !isConnected ||
    !selectedToken ||
    !tokenAmount ||
    Number(tokenAmount) <= 0 ||
    !isSaleActive ||
    isPaused ||
    publicSaleLoading ||
    isApprovalRequired ||
    isPurchasePending;

  const buttonText = !isConnected
    ? 'Connect Wallet'
    : !isSaleActive || isPaused
      ? 'Sale Not Active'
      : !selectedToken || !tokenAmount
        ? 'Enter Amount'
        : isApprovalRequired
          ? 'Approving...'
          : isPurchasePending
            ? 'Purchasing...'
            : approvalStatus === 'error'
              ? 'Approval Failed'
              : purchaseStatus === 'error'
                ? 'Purchase Failed'
                : 'Buy C100';

  const steps = [
    'Enter Amount',
    'Check Allowance',
    'Approve Token',
    'Purchase C100',
  ];

  const handleConnectSuccess = async () => {
    try {
      await dispatch(connectWallet()).unwrap();
      setConnectDialogOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setTransactionError('Failed to connect wallet. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 500,
        mx: 'auto',
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: theme.shadows[20],
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{ mb: 4, fontWeight: 600 }}
      >
        Buy COIN100 Tokens
      </Typography>

      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 4,
          '& .MuiStepLabel-root .Mui-completed': {
            color: theme.palette.success.main,
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: theme.palette.primary.main,
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Token</InputLabel>
        <Select
          value={selectedToken?.address || ''}
          onChange={handleTokenSelect}
          label="Select Token"
          disabled={!isConnected || publicSaleLoading}
          startAdornment={
            <InputAdornment position="start">
              <AccountBalanceWallet />
            </InputAdornment>
          }
        >
          <MenuItem value="" disabled>
            Select Token
          </MenuItem>
          {allowedTokens.map((token: USDCToken) => (
            <MenuItem key={token.address} value={token.address}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Typography>{token.symbol}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Balance: {token.balance}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <TextField
          label="Amount"
          value={tokenAmount}
          onChange={handleTokenAmountChange}
          disabled={!selectedToken || !isConnected || publicSaleLoading}
          helperText={
            selectedToken
              ? `Available Balance: ${selectedToken.balance} ${selectedToken.symbol}`
              : ''
          }
          InputProps={{
            endAdornment: selectedToken && (
              <InputAdornment position="end">
                {selectedToken.symbol}
              </InputAdornment>
            ),
          }}
        />
      </FormControl>

      {selectedToken && tokenAmount && (
        <Fade in>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <SwapHoriz /> Transaction Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">You Pay:</Typography>
                <Typography>
                  {tokenAmount} {selectedToken.symbol}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">You Receive:</Typography>
                <Typography>{c100Amount} C100</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Rate:</Typography>
                <Typography>
                  1 C100 = {selectedToken.rate} {selectedToken.symbol}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}

      {(approvalStatus === 'pending' || purchaseStatus === 'pending') && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.7 },
              '100%': { opacity: 1 },
            },
          }}
          icon={<CircularProgress size={20} />}
        >
          <AlertTitle>Transaction In Progress</AlertTitle>
          <Typography>
            {approvalStatus === 'pending'
              ? 'Please approve the transaction in your wallet...'
              : 'Processing your purchase...'}
          </Typography>
        </Alert>
      )}

      {approvalHash && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
            <AlertTitle>Approval Successful</AlertTitle>
            <Link
              href={`https://polygonscan.com/tx/${approvalHash}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: theme.palette.success.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              View approval transaction
            </Link>
          </Alert>
        </Fade>
      )}

      {purchaseHash && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
            <AlertTitle>Purchase Successful!</AlertTitle>
            <Link
              href={`https://polygonscan.com/tx/${purchaseHash}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: theme.palette.success.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              View purchase transaction
            </Link>
          </Alert>
        </Fade>
      )}

      {transactionError && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorIcon />}>
            <AlertTitle>Transaction Failed</AlertTitle>
            {transactionError}
          </Alert>
        </Fade>
      )}

      <LoadingButton
        variant="contained"
        fullWidth
        size="large"
        onClick={handlePurchaseClick}
        disabled={buttonDisabled}
        loading={isApprovalRequired || isPurchasePending}
        sx={{
          py: 1.5,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          '&:hover': {
            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          },
        }}
      >
        {buttonText}
      </LoadingButton>

      <MetaMaskPopup
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        onSuccess={handleConnectSuccess}
      />
    </Box>
  );
}
