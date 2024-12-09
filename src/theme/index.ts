import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode
          primary: {
            main: '#3f51b5',
            light: '#757de8',
            dark: '#002984',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#5e35b1',
            light: '#9162e4',
            dark: '#280680',
            contrastText: '#ffffff',
          },
          background: {
            default: '#ffffff',
            paper: '#f5f5f5',
          },
          text: {
            primary: '#1a237e',
            secondary: '#424242',
          },
        }
      : {
          // Dark mode
          primary: {
            main: '#5c6bc0',
            light: '#8e99f3',
            dark: '#26418f',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#7c4dff',
            light: '#b47cff',
            dark: '#3f1dcb',
            contrastText: '#ffffff',
          },
          background: {
            default: '#0a1929',
            paper: '#1a223f',
          },
          text: {
            primary: '#ffffff',
            secondary: '#b0bec5',
          },
        }),
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.7,
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '28px',
          padding: '8px 24px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export const getTheme = (mode: PaletteMode) => {
  let theme = createTheme(getDesignTokens(mode));
  theme = responsiveFontSizes(theme);
  return theme;
};

export default getTheme;
