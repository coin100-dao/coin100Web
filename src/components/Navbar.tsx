// src/components/Navbar.tsx

import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  useTheme,
  useMediaQuery,
  List,
  CircularProgress,
  Drawer,
  ListItemButton,
  ListItemText,
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
import { disconnectWallet, connectWallet } from '../store/slices/walletSlice';
import MetaMaskIcon from '../assets/MetaMask_Fox.png';
import PolygonIcon from '../assets/polygon-matic-logo.svg';
import MetaMaskPopup from './wallet/MetaMaskPopup';

interface NavbarProps {
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTheme }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { address, isConnecting } = useAppSelector(
    (state: RootState) => state.wallet
  );

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = React.useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = React.useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleWalletClick = () => {
    if (address) {
      setWalletDialogOpen(true);
    } else {
      setConnectDialogOpen(true);
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

  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Sale', path: '/sale' },
    { name: 'Whitepaper', path: '/whitepaper' },
    { name: 'FAQ', path: '/faq' },
    // { name: 'Dashboard', path: '/dashboard' },
  ];

  const mobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={() => setMobileMenuOpen(false)}
        onKeyDown={() => setMobileMenuOpen(false)}
      >
        <List>
          {pages.map((page) => (
            <ListItemButton
              key={page.name}
              component={RouterLink}
              to={page.path}
            >
              <ListItemText primary={page.name} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          {/* Left Side */}
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileMenuOpen(true)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  component={RouterLink}
                  to={page.path}
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>
          )}

          {/* Right Side */}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleWalletClick}
              startIcon={
                isConnecting ? null : address ? (
                  <Box
                    component="img"
                    src={MetaMaskIcon}
                    alt="MetaMask"
                    sx={{ width: 20, height: 20 }}
                  />
                ) : (
                  <AccountBalanceWallet />
                )
              }
              disabled={isConnecting}
              sx={{ ml: 1 }}
            >
              {isConnecting ? (
                <CircularProgress size={20} color="inherit" />
              ) : address ? (
                <>
                  {truncateAddress(address)}
                  <Box
                    component="img"
                    src={PolygonIcon}
                    alt="Polygon"
                    sx={{ width: 20, height: 20, ml: 1 }}
                  />
                </>
              ) : (
                'Connect Wallet'
              )}
            </Button>
            <IconButton onClick={toggleTheme} color="inherit">
              {theme.palette.mode === 'dark' ? (
                <Brightness7 />
              ) : (
                <Brightness4 />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {mobileMenu}

      {/* Wallet Info Dialog */}
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
            <strong>Connected Address:</strong>
            <br />
            {address}
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

      {/* MetaMask Popup */}
      <MetaMaskPopup
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        onSuccess={() => {
          setConnectDialogOpen(false);
          void dispatch(connectWallet());
        }}
      />
    </>
  );
};

export default Navbar;
