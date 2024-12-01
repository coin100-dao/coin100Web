// src/App.tsx

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import AppRoutes from './routes/Routes';
import Layout from './Layout';
import { persistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';

const App: React.FC = () => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
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
