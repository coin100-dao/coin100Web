// ICO.tsx

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  fetchICOData,
  fetchCOIN100Data,
  buyTokensWithPOL,
  fetchAllData,
  fetchTokenBalance,
} from '../store/slices/web3Slice';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const InfoItem: React.FC<{
  label: string;
  value: string | number | boolean;
}> = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Box mb={2}>
      <Typography
        variant="subtitle2"
        sx={{ color: theme.palette.text.secondary }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
      </Typography>
    </Box>
  );
};

const ICO: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { walletAddress, icoData, coin100Data, loading, error, tokenBalance } =
    useSelector((state: RootState) => state.web3);
  const [polAmount, setPolAmount] = useState<string>('');
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buySuccess, setBuySuccess] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      dispatch(fetchAllData());
      const interval = setInterval(() => {
        dispatch(fetchICOData());
        dispatch(fetchCOIN100Data());
      }, 15000); // Fetch data every 15 seconds
      return () => clearInterval(interval);
    }
  }, [dispatch, walletAddress]);

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
        `Successfully purchased ${(Number(polAmount) * Number(icoData?.polRate || '0')).toFixed(2)} C100 tokens.`
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

  // Determine sale state
  const now = Date.now() / 1000;
  const isActive =
    icoData &&
    !icoData.finalized &&
    !icoData.paused &&
    now >= icoData.startTime &&
    now <= icoData.endTime;

  const formattedStart = icoData?.startTime
    ? format(new Date(icoData.startTime * 1000), 'PPpp')
    : 'Loading...';
  const formattedEnd = icoData?.endTime
    ? format(new Date(icoData.endTime * 1000), 'PPpp')
    : 'Loading...';

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        COIN100 Public Sale
      </Typography>

      {error && !icoData && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {icoData && (
        <Grid container spacing={4}>
          {/* Sale Information */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sale Information
                </Typography>
                <InfoItem label="Start Time" value={formattedStart} />
                <InfoItem label="End Time" value={formattedEnd} />
                <InfoItem label="Finalized" value={icoData.finalized} />
                <InfoItem label="Paused" value={icoData.paused} />
                <InfoItem
                  label="Governor Contract"
                  value={icoData.governorContract}
                />
                <InfoItem label="Treasury Address" value={icoData.treasury} />
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Token Details */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Token Details
                </Typography>
                <InfoItem
                  label="POL Rate (C100 per 1 POL)"
                  value={icoData.polRate}
                />
                <InfoItem
                  label="C100 Balance in Sale"
                  value={icoData.c100Balance}
                />
                <InfoItem
                  label="C100 Token Address"
                  value={icoData.c100TokenAddress}
                />
              </CardContent>
            </StyledCard>
          </Grid>

          {/* COIN100 Information */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  COIN100 Information
                </Typography>
                {coin100Data ? (
                  <>
                    <InfoItem
                      label="Total Supply"
                      value={`${coin100Data.totalSupply} C100`}
                    />
                    <InfoItem
                      label="Last Rebase"
                      value={
                        coin100Data.lastRebaseTimestamp
                          ? format(
                              new Date(coin100Data.lastRebaseTimestamp * 1000),
                              'PPpp'
                            )
                          : 'N/A'
                      }
                    />
                    <InfoItem
                      label="Rebase Frequency"
                      value={`${(coin100Data.rebaseFrequency / 86400).toFixed(0)} days`}
                    />
                    <InfoItem
                      label="Transfers with Fee"
                      value={coin100Data.transfersWithFee}
                    />
                    <InfoItem
                      label="Transfer Fee"
                      value={`${coin100Data.transferFeeBasisPoints / 100}%`}
                    />
                    <InfoItem
                      label="LP Reward Percentage"
                      value={`${coin100Data.lpRewardPercentage}%`}
                    />
                    <InfoItem
                      label="Max LP Reward Percentage"
                      value={`${coin100Data.maxLpRewardPercentage}%`}
                    />
                    <InfoItem
                      label="Governor Contract"
                      value={coin100Data.governorContract}
                    />
                    <InfoItem
                      label="Treasury Address"
                      value={coin100Data.treasury}
                    />
                  </>
                ) : (
                  <Typography variant="body1">Loading...</Typography>
                )}
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Your Wallet */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Wallet
                </Typography>
                {walletAddress ? (
                  <>
                    <InfoItem label="Wallet Address" value={walletAddress} />
                    <InfoItem
                      label="Your C100 Balance"
                      value={tokenBalance || '0'}
                    />
                  </>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Please connect your wallet in the header to see your balance
                    and participate.
                  </Alert>
                )}
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Participate in the ICO */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Participate in the ICO
                </Typography>
                {icoData.finalized && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    The ICO has been finalized. No further participation is
                    possible.
                  </Alert>
                )}
                {!icoData.finalized && icoData.paused && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    The ICO is currently paused.
                  </Alert>
                )}
                {!icoData.finalized && !icoData.paused && !isActive && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    The ICO is not active at this time.
                  </Alert>
                )}
                {walletAddress && isActive && (
                  <>
                    {loading && (
                      <Box mb={2}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                    {(buyError || buySuccess) && (
                      <>
                        {buyError && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {buyError}
                          </Alert>
                        )}
                        {buySuccess && (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            {buySuccess}
                          </Alert>
                        )}
                      </>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        maxWidth: 400,
                      }}
                    >
                      <TextField
                        label="POL Amount"
                        type="number"
                        value={polAmount}
                        onChange={(e) => setPolAmount(e.target.value)}
                        helperText={
                          polAmount && !isNaN(Number(polAmount))
                            ? `You will receive: ${(Number(polAmount) * Number(icoData.polRate)).toFixed(2)} C100`
                            : 'Enter a valid POL amount'
                        }
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBuy}
                        disabled={
                          !polAmount ||
                          isNaN(Number(polAmount)) ||
                          Number(polAmount) <= 0 ||
                          loading
                        }
                      >
                        Buy C100 with POL
                      </Button>
                    </Box>
                  </>
                )}

                {!walletAddress && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Connect your wallet to participate in the sale.
                  </Alert>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {loading && !icoData && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default ICO;
