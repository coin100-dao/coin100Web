// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize your primary color
    },
    secondary: {
      main: '#dc004e', // Customize your secondary color
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
  // You can add more customizations here
});

export default theme;
