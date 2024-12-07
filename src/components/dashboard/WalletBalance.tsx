import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const WalletBalance: React.FC = () => {
  const { walletAddress, tokenBalance, loading } = useAppSelector(
    (state) => state.web3
  );

  return (
    <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalanceWalletIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Wallet</Typography>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        ) : walletAddress ? (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Address:
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 2 }}>
              {walletAddress}
            </Typography>

            <Typography variant="body2" color="textSecondary" gutterBottom>
              Balance:
            </Typography>
            <Typography variant="h5">
              {tokenBalance ? parseFloat(tokenBalance).toFixed(4) : '0'} COIN100
            </Typography>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Typography variant="body1" color="textSecondary">
              No wallet connected
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default WalletBalance;
