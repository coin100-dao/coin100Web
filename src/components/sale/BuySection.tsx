import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  calculateC100Amount,
  selectUsdcToken,
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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Info } from '@mui/icons-material';

const BuySection: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [usdcAmount, setUsdcAmount] = useState<string>('');
  const [c100Amount, setC100Amount] = useState<string>('0');
  const [error, setError] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);

  const {
    error: saleError,
    isSaleActive,
    isPaused,
    walletAddress,
    usdcTokens,
    selectedUsdcToken,
    purchaseState,
  } = useSelector((state: RootState) => state.publicSale);

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

  useEffect(() => {
    // Reset purchase state when component unmounts
    return () => {
      dispatch(resetPurchaseState());
    };
  }, [dispatch]);

  const handleUsdcTokenChange = (event: SelectChangeEvent<string>) => {
    dispatch(selectUsdcToken(event.target.value));
  };

  const handleBuy = async () => {
    if (!usdcAmount) return;

    try {
      // First check allowance
      const allowanceResult = await dispatch(
        checkUsdcAllowance({ usdcAmount })
      ).unwrap();

      if (!allowanceResult.hasAllowance) {
        // Need to approve first
        setActiveStep(0);
        await dispatch(approveUsdcSpending({ usdcAmount })).unwrap();
        setActiveStep(1);
      } else {
        // Already approved, go straight to buying
        setActiveStep(1);
      }

      // Now buy tokens
      await dispatch(buyC100Tokens({ usdcAmount })).unwrap();
      setActiveStep(2);

      // Reset form
      setUsdcAmount('');
      setC100Amount('0');
      setTimeout(() => {
        setActiveStep(0);
        dispatch(resetPurchaseState());
      }, 5000);
    } catch (error: unknown) {
      console.error('Failed to process transaction:', error);
      setError(error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  const isDisabled =
    !walletAddress ||
    !isSaleActive ||
    isPaused ||
    !usdcAmount ||
    Number(usdcAmount) <= 0 ||
    Number(usdcAmount) > Number(selectedUsdcToken.balance) ||
    purchaseState.isApproving ||
    purchaseState.isBuying;

  const steps = ['Approve USDC', 'Buy C100', 'Complete'];

  const getButtonText = () => {
    if (purchaseState.isApproving) return 'Approving USDC...';
    if (purchaseState.isBuying) return 'Buying C100...';
    if (!walletAddress) return 'Connect Wallet';
    if (activeStep === 2) return 'Purchase Complete!';
    return 'Buy C100 Tokens';
  };

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

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select USDC Token</InputLabel>
            <Select
              value={selectedUsdcToken.address}
              onChange={handleUsdcTokenChange}
              label="Select USDC Token"
              disabled={purchaseState.isApproving || purchaseState.isBuying}
            >
              {usdcTokens.map((token) => (
                <MenuItem key={token.address} value={token.address}>
                  {token.name} - Balance: {Number(token.balance).toFixed(2)}{' '}
                  USDC
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            Selected USDC Balance:{' '}
            {Number(selectedUsdcToken.balance).toFixed(2)} USDC
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

        {purchaseState.approvalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {purchaseState.approvalError}
          </Alert>
        )}

        {purchaseState.purchaseError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {purchaseState.purchaseError}
          </Alert>
        )}

        {purchaseState.approvalHash && (
          <Alert severity="info" sx={{ mb: 2 }}>
            USDC Approved! Transaction:{' '}
            <Link
              href={`https://polygonscan.com/tx/${purchaseState.approvalHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on PolygonScan
            </Link>
          </Alert>
        )}

        {purchaseState.purchaseHash && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Purchase Complete! Transaction:{' '}
            <Link
              href={`https://polygonscan.com/tx/${purchaseState.purchaseHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on PolygonScan
            </Link>
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
          loading={purchaseState.isApproving || purchaseState.isBuying}
          disabled={isDisabled}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }}
        >
          {getButtonText()}
        </LoadingButton>
      </CardContent>
    </Card>
  );
};

export default BuySection;
