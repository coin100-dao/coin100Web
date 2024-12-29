import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  selectToken,
  checkUsdcAllowance,
  approveUsdcSpending,
  buyC100Tokens,
  calculateC100Amount,
} from '../../store/slices/publicSaleSlice';
import MetaMaskPopup from '../wallet/MetaMaskPopup';

const BuySection: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);

  const [tokenAmount, setTokenAmount] = useState('');
  const [c100Amount, setC100Amount] = useState('0');

  const {
    allowedTokens,
    selectedToken,
    purchaseState,
    isSaleActive,
    loading: publicSaleLoading,
  } = useSelector((state: RootState) => state.publicSale);

  const { isConnected, isConnecting } = useSelector(
    (state: RootState) => state.wallet
  );

  useEffect(() => {
    if (selectedToken && tokenAmount) {
      console.log('Calculating C100 amount for:', {
        tokenAmount,
        rate: selectedToken.rate,
      });
      const amount = calculateC100Amount(
        tokenAmount,
        selectedToken.rate || '0'
      );
      console.log('Calculated C100 amount:', amount);
      setC100Amount(amount);
    } else {
      setC100Amount('0');
    }
  }, [tokenAmount, selectedToken]);

  const handleTokenSelect = async (tokenAddress: string) => {
    try {
      console.log('Selecting token:', tokenAddress);
      await dispatch(selectToken(tokenAddress)).unwrap();
      setTokenAmount('');
      setC100Amount('0');
    } catch (error) {
      console.error('Failed to select token:', error);
    }
  };

  const handleBuy = async () => {
    if (!selectedToken || !tokenAmount) return;

    try {
      console.log('Starting purchase process...');
      console.log('Checking allowance...');
      const { hasAllowance } = await dispatch(
        checkUsdcAllowance({ usdcAmount: tokenAmount })
      ).unwrap();

      if (!hasAllowance) {
        console.log('Insufficient allowance, requesting approval...');
        await dispatch(
          approveUsdcSpending({ usdcAmount: tokenAmount })
        ).unwrap();
      }

      console.log('Proceeding with purchase...');
      await dispatch(buyC100Tokens({ usdcAmount: tokenAmount })).unwrap();

      // Reset form after successful purchase
      setTokenAmount('');
      setC100Amount('0');
    } catch (error) {
      console.error('Purchase process failed:', error);
    }
  };

  const handleConnectClick = () => {
    setConnectDialogOpen(true);
  };

  const isButtonDisabled =
    !isConnected ||
    !selectedToken ||
    !tokenAmount ||
    Number(tokenAmount) <= 0 ||
    purchaseState.isApproving ||
    purchaseState.isBuying ||
    !isSaleActive ||
    publicSaleLoading;

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (purchaseState.isApproving) return 'Approving...';
    if (purchaseState.isBuying) return 'Buying...';
    if (!isSaleActive) return 'Sale Not Active';
    if (!selectedToken || !tokenAmount) return 'Enter Amount';
    return 'Buy C100 Tokens';
  };

  return (
    <>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme.shadows[10],
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Buy COIN100 Tokens
          </Typography>

          {!isConnected ? (
            <Box textAlign="center" py={3}>
              <Typography color="textSecondary" paragraph>
                Please connect your wallet to buy tokens
              </Typography>
              <Button
                variant="contained"
                onClick={handleConnectClick}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Connect Wallet'
                )}
              </Button>
            </Box>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Payment Token</InputLabel>
                <Select
                  value={selectedToken?.address || ''}
                  onChange={(e) => handleTokenSelect(e.target.value)}
                  label="Select Payment Token"
                >
                  {allowedTokens.map((token) => (
                    <MenuItem key={token.address} value={token.address}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>{token.symbol}</span>
                        <Chip
                          label={`Balance: ${token.balance}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Rate: ${token.rate} ${token.symbol}/C100`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: selectedToken?.symbol,
                }}
              />

              <Typography variant="body1" sx={{ mb: 2 }}>
                You will receive: {c100Amount} C100
              </Typography>

              <Button
                fullWidth
                variant="contained"
                onClick={handleBuy}
                disabled={isButtonDisabled}
              >
                {purchaseState.isApproving || purchaseState.isBuying ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  getButtonText()
                )}
              </Button>

              {purchaseState.approvalError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {purchaseState.approvalError}
                </Alert>
              )}

              {purchaseState.purchaseError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {purchaseState.purchaseError}
                </Alert>
              )}

              {purchaseState.approvalHash && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Approval successful! Transaction hash:{' '}
                  {purchaseState.approvalHash}
                </Alert>
              )}

              {purchaseState.purchaseHash && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Purchase successful! Transaction hash:{' '}
                  {purchaseState.purchaseHash}
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* MetaMask Popup */}
      <MetaMaskPopup
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
      />
    </>
  );
};

export default BuySection;
