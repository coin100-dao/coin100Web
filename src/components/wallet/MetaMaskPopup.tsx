import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
  IconButton,
  Fade,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  AccountBalanceWallet,
  ArrowForward,
  Security,
} from '@mui/icons-material';
import MetaMaskIcon from '../../assets/MetaMask_Fox.png';

interface MetaMaskPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MetaMaskPopup({
  open,
  onClose,
  onSuccess,
}: MetaMaskPopupProps) {
  const theme = useTheme();

  const handleConnect = async () => {
    try {
      await onSuccess();
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
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 2,
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.grey[900]})`
              : `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
      />

      <DialogTitle
        sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <AccountBalanceWallet />
        Connect Wallet
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box
            component="img"
            src={MetaMaskIcon}
            alt="MetaMask"
            sx={{
              width: 80,
              height: 80,
              mb: 2,
              filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))',
            }}
          />
          <Typography variant="h6" gutterBottom>
            Connect with MetaMask
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Connect your MetaMask wallet to access COIN100 features
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Security fontSize="small" color="primary" />
              <Typography variant="subtitle2">Why Connect Wallet?</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" align="left">
              • Buy and manage COIN100 tokens
              <br />
              • Access exclusive features
              <br />• Track your transactions
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConnect}
          autoFocus
          sx={{
            flex: 1,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
          }}
          endIcon={<ArrowForward />}
        >
          Connect
        </Button>
      </DialogActions>
    </Dialog>
  );
}
