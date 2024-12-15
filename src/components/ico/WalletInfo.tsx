import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  useTheme,
  Stack,
  Button,
} from '@mui/material';
import {
  AccountBalanceWallet,
  ContentCopy,
  OpenInNew,
} from '@mui/icons-material';

const WalletInfo: React.FC = () => {
  const theme = useTheme();
  const { walletAddress, tokenBalance } = useSelector(
    (state: RootState) => state.web3
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openInExplorer = (address: string) => {
    window.open(`https://polygonscan.com/address/${address}`, '_blank');
  };

  if (!walletAddress) {
    return (
      <Card
        sx={{
          background: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 2,
          flex: 1,
        }}
      >
        <CardContent
          sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Connect wallet to view balance
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 2,
        flex: 1,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" fontWeight="bold">
              My Wallet
            </Typography>
            <AccountBalanceWallet color="primary" fontSize="small" />
          </Box>

          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Address
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                  background: theme.palette.action.hover,
                  p: 0.5,
                  borderRadius: 1,
                  mt: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {shortenAddress(walletAddress)}
                </Typography>
                <Button
                  size="small"
                  onClick={() => copyToClipboard(walletAddress)}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <ContentCopy fontSize="small" />
                </Button>
                <Button
                  size="small"
                  onClick={() => openInExplorer(walletAddress)}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <OpenInNew fontSize="small" />
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                C100 Balance
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                {tokenBalance ? Number(tokenBalance).toLocaleString() : '0'}{' '}
                C100
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WalletInfo;
