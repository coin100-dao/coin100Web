// src/components/Layout.tsx
import React from 'react';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';

interface LayoutProps {
  toggleTheme: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ toggleTheme, children }) => {
  return (
    <>
      <Navbar toggleTheme={toggleTheme} />
      <Box component="main" sx={{ mt: 4, px: { xs: 2, sm: 3, md: 4 }, pb: 4 }}>
        {children}
      </Box>
    </>
  );
};

export default Layout;
