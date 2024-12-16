import React from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { connectWallet } from '../../store/slices/web3Slice';

interface WalletBalanceProps {
  isWalletConnected: boolean;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ isWalletConnected }) => {
  const dispatch = useAppDispatch();
  const { walletAddress, balance, loading } = useAppSelector(
    (state) => state.web3
  );

  const handleConnectWallet = () => {
    dispatch(connectWallet());
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
      ) : isWalletConnected ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Address:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              wordBreak: 'break-all',
              mb: 2,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            {walletAddress}
          </Typography>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            Balance:
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            {balance ? parseFloat(balance).toFixed(4) : '0'} COIN100
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnectWallet}
            startIcon={<AccountBalanceWalletIcon />}
            sx={{
              width: '100%',
              py: 1.5,
            }}
          >
            Connect Wallet
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default WalletBalance;
