import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  Box,
  IconButton,
  Typography,
  Stack,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { connectWallet } from '../../store/slices/walletSlice';
import MetaMaskIcon from '../../assets/MetaMask_Fox.png';
import PolygonIcon from '../../assets/polygon-matic-logo.svg';

interface MetaMaskPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MetaMaskPopup: React.FC<MetaMaskPopupProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { isConnecting, error } = useSelector(
    (state: RootState) => state.wallet
  );

  const handleConnect = async () => {
    try {
      console.log('Connecting wallet from MetaMaskPopup...');
      await dispatch(connectWallet()).unwrap();
      console.log('Wallet connected successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <DialogTitle>
        Connect Wallet
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box textAlign="center" py={2}>
          <Stack spacing={3} alignItems="center">
            <Box
              component="img"
              src={MetaMaskIcon}
              alt="MetaMask"
              sx={{ width: 80, height: 80 }}
            />
            <Typography variant="h6">Connect with MetaMask</Typography>
            <DialogContentText>
              Connect your wallet to participate in the COIN100 public sale.
            </DialogContentText>
            <Box
              component="img"
              src={PolygonIcon}
              alt="Polygon"
              sx={{ width: 40, height: 40 }}
            />
            <Typography variant="body2" color="textSecondary">
              Make sure you&apos;re connected to the Polygon network
            </Typography>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={handleConnect}
              disabled={isConnecting}
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              {isConnecting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Connect MetaMask'
              )}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MetaMaskPopup;
