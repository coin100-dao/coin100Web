// src/components/Navbar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { connectWallet } from '../store/slices/web3Slice';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import MetaMaskIcon from '../assets/MetaMask_Fox.svg';

// Styled Components
const WalletInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const WalletAddress = styled(Typography)(() => ({
  maxWidth: '150px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { walletAddress, loading, error } = useSelector(
    (state: RootState) => state.web3
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  React.useEffect(() => {
    if (error) {
      setSnackbarOpen(true);
    }
  }, [error]);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleConnectWallet = () => {
    dispatch(connectWallet());
  };

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const drawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItemButton component={RouterLink} to="/">
          <ListItemText primary={'Home'} />
        </ListItemButton>
        {/* Add more navigation items here */}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Hamburger Menu for Mobile */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: 'block', sm: 'none' }, mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Title / Brand */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link
              component={RouterLink}
              to="/"
              color="inherit"
              underline="none"
            >
              {'Home'}
            </Link>
          </Typography>

          {/* Connect Wallet Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {walletAddress ? (
              <WalletInfoBox>
                {/* MetaMask Icon */}
                <Box
                  component="img"
                  src={MetaMaskIcon}
                  alt="MetaMask"
                  sx={{ width: 24, height: 24 }}
                />

                {/* Truncated Wallet Address */}
                <WalletAddress variant="body1">
                  {truncateAddress(walletAddress)}
                </WalletAddress>
              </WalletInfoBox>
            ) : (
              <Button
                color="inherit"
                variant="outlined"
                onClick={handleConnectWallet}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null
                }
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    borderColor: 'white',
                  },
                }}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile Navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerList}
      </Drawer>

      {/* Snackbar for Error Messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Navbar;
