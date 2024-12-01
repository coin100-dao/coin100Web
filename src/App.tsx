// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import AppRoutes from './routes/Routes';
import Navbar from './components/Navbar';
import Container from '@mui/material/Container';

const App: React.FC = () => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = React.useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar toggleTheme={toggleTheme} />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <AppRoutes />
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
