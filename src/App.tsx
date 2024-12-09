// src/App.tsx

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import AppRoutes from './routes/Routes';
import Layout from './Layout';
import { RootState, persistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { useSelector, useDispatch } from 'react-redux';
import { setThemeMode } from './store/slices/globalSlice';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.global.themeMode);

  const toggleTheme = () => {
    dispatch(setThemeMode(mode === 'light' ? 'dark' : 'light'));
  };

  const theme = React.useMemo(() => getTheme(mode), [mode]);

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
