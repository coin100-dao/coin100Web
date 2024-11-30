// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import Navbar from './components/Navbar';
import Container from '@mui/material/Container';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { decodeJWT } from './utils/decodeJWT';
import { logout } from './store/slices/authSlice';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      try {
        const decoded = decodeJWT(token);
        const currentTime = Date.now() / 1000; // Current time in seconds

        if (decoded.exp < currentTime) {
          // Token has expired
          dispatch(logout());
        }
        // Optionally, set up a timer to auto-logout when the token expires
        // const timeout = (decoded.exp - currentTime) * 1000;
        // const timer = setTimeout(() => {
        //   dispatch(logout());
        // }, timeout);
        // return () => clearTimeout(timer);
      } catch (error) {
        console.error('Invalid token:', error);
        dispatch(logout());
      }
    }
  }, [token, dispatch]);

  return (
    <Router>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <AppRoutes />
      </Container>
    </Router>
  );
};

export default App;
