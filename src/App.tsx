// src/App.tsx

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import AppRoutes from './routes/Routes';
import Layout from './Layout';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { RootState, persistor } from './store/store';
import { disconnectWallet } from './store/slices/web3Slice';
import { PersistGate } from 'redux-persist/integration/react';

const App: React.FC = () => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = React.useMemo(() => getTheme(mode), [mode]);

  const dispatch = useAppDispatch();
  const { connectedAt, walletAddress } = useAppSelector(
    (state: RootState) => state.web3
  );

  React.useEffect(() => {
    if (walletAddress && connectedAt) {
      const currentTime = Date.now();
      const elapsed = currentTime - connectedAt;
      const fiveMinutes = 5 * 60 * 1000;
      const timeLeft = fiveMinutes - elapsed;

      if (timeLeft <= 0) {
        dispatch(disconnectWallet());
      } else {
        const timer = setTimeout(() => {
          dispatch(disconnectWallet());
        }, timeLeft);

        return () => clearTimeout(timer);
      }
    }
  }, [walletAddress, connectedAt, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Layout toggleTheme={toggleTheme}>
            <AppRoutes />
          </Layout>
        </Router>
      </PersistGate>
    </ThemeProvider>
  );
};

export default App;
