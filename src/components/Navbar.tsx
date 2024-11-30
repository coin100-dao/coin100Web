// src/components/Navbar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

const Navbar: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => !!state.auth.token);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); // Redirect to home after logout
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
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
          <ListItemText primary={isAuthenticated ? 'Dashboard' : 'Home'} />
        </ListItemButton>
        {!isAuthenticated ? (
          <>
            <ListItemButton component={RouterLink} to="/signin">
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/signup">
              <ListItemText primary="Signup" />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        )}
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
              {isAuthenticated ? 'Dashboard' : 'Home'}
            </Link>
          </Typography>

          {/* Desktop Links */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {!isAuthenticated ? (
              <>
                <Button color="inherit" component={RouterLink} to="/signin">
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/signup">
                  Signup
                </Button>
              </>
            ) : (
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile Navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerList}
      </Drawer>
    </Box>
  );
};

export default Navbar;
