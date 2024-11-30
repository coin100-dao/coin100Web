// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import Navbar from './components/Navbar';
import Container from '@mui/material/Container';

const App: React.FC = () => {

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
