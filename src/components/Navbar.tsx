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
  useMediaQuery,
  List,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Drawer,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountBalanceWallet,
  Brightness4,
  Brightness7,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { RootState } from '../store/store';
import {
  disconnectWallet,
  connectAndFetchBalance,
} from '../store/slices/web3Slice';
import MetaMaskIcon from '../assets/MetaMask_Fox.png';
import PolygonIcon from '../assets/polygon-matic-logo.svg';

interface NavbarProps {
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTheme }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { walletAddress, loading } = useAppSelector(
    (state: RootState) => state.web3
  );

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = React.useState(false);
  const [walletSelectDialogOpen, setWalletSelectDialogOpen] =
    React.useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleWalletClick = () => {
    if (walletAddress) {
      setWalletDialogOpen(true);
    } else {
      setWalletSelectDialogOpen(true);
    }
  };

  const handleWalletSelect = async () => {
    setWalletSelectDialogOpen(false);
    await dispatch(connectAndFetchBalance());
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
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={() => setMobileMenuOpen(false)}
        onKeyDown={() => setMobileMenuOpen(false)}
      >
        <List>
          <ListItemButton component={RouterLink} to="/">
            <ListItemText primary="Home" />
          </ListItemButton>
          {walletAddress && (
            <ListItemButton component={RouterLink} to="/dashboard">
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          )}
        </List>
      </Box>
    </Drawer>
  );

  React.useEffect(() => {
    if (walletAddress) {
      navigate('/dashboard');
    }
  }, [walletAddress, navigate]);

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            COIN100
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" component={RouterLink} to="/">
                Home
              </Button>
              {walletAddress && (
                <Button color="inherit" component={RouterLink} to="/dashboard">
                  Dashboard
                </Button>
              )}
            </Box>
          )}

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
                    alt="MetaMask"
                    sx={{ width: 20, height: 20 }}
                  />
                ) : (
                  <AccountBalanceWallet />
                )
              }
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : walletAddress ? (
                <>
                  {truncateAddress(walletAddress)}
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

      {/* Wallet Selection Dialog */}
      <Dialog
        open={walletSelectDialogOpen}
        onClose={() => setWalletSelectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Select Wallet
          <IconButton
            onClick={() => setWalletSelectDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItemButton onClick={handleWalletSelect}>
              <ListItemIcon>
                <Box
                  component="img"
                  src={MetaMaskIcon}
                  alt="MetaMask"
                  sx={{ width: 32, height: 32 }}
                />
              </ListItemIcon>
              <ListItemText primary="MetaMask" />
            </ListItemButton>
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
