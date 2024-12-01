// src/components/Navbar.tsx
import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountBalanceWallet,
  Brightness4,
  Brightness7,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { RootState } from '../store/store';
import { connectWallet, disconnectWallet } from '../store/slices/web3Slice';
import MetaMaskIcon from '../assets/MetaMask_Fox.svg';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import { ListItemButton } from '@mui/material';

interface NavbarProps {
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTheme }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { walletAddress, loading } = useAppSelector(
    (state: RootState) => state.web3
  );

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = React.useState(false);

  const handleWalletClick = () => {
    if (walletAddress) {
      setWalletDialogOpen(true);
    } else {
      dispatch(connectWallet());
    }
  };

  const handleDisconnect = () => {
    dispatch(disconnectWallet());
    setWalletDialogOpen(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const mobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <List sx={{ width: 250 }}>
        <ListItemButton
          component={RouterLink}
          to="/"
          onClick={() => setMobileMenuOpen(false)}
        >
          <ListItemText primary="Home" />
        </ListItemButton>
        {walletAddress && (
          <ListItemButton
            component={RouterLink}
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ display: { sm: 'none' }, mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            COIN100
          </Typography>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            <Button color="inherit" component={RouterLink} to="/">
              Home
            </Button>
            {walletAddress && (
              <Button color="inherit" component={RouterLink} to="/dashboard">
                Dashboard
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={toggleTheme} color="inherit">
              {theme.palette.mode === 'dark' ? (
                <Brightness7 />
              ) : (
                <Brightness4 />
              )}
            </IconButton>

            <Button
              variant="outlined"
              color="inherit"
              onClick={handleWalletClick}
              startIcon={
                loading ? null : walletAddress ? (
                  <Box
                    component="img"
                    src={MetaMaskIcon}
                    sx={{ width: 20, height: 20 }}
                  />
                ) : (
                  <AccountBalanceWallet />
                )
              }
              disabled={loading}
            >
              {loading
                ? 'Connecting...'
                : walletAddress
                  ? truncateAddress(walletAddress)
                  : 'Connect Wallet'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {mobileMenu}

      {/* Wallet Dialog */}
      <Dialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Wallet Info
          <IconButton
            onClick={() => setWalletDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Connected Address:
            <br />
            {walletAddress}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={handleDisconnect}
            >
              Disconnect Wallet
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
