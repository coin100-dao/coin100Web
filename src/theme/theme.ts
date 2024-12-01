// src/theme/theme.ts
import { createTheme, PaletteMode, ThemeOptions } from '@mui/material/styles';

// Define color variables
const colors = {
  main: '#052e44',
  primaryLight: '#1976d2',
  primaryDark: '#90caf9',
  secondaryLight: '#dc004e',
  secondaryDark: '#f48fb1',
  backgroundLight: '#f4f6f8',
  backgroundDark: '#121212',
  paperLight: '#ffffff',
  paperDark: '#1e1e1e',
  textLight: '#000000',
  textDark: '#ffffff',
  shadowLight: '0px 2px 4px -1px rgba(0,0,0,0.1)',
  shadowDark: '0px 2px 4px -1px rgba(255,255,255,0.1)',
};

export const getTheme = (mode: PaletteMode) => {
  const isLight = mode === 'light';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: colors.main,
        light: isLight ? colors.primaryLight : undefined,
        dark: !isLight ? colors.primaryDark : undefined,
      },
      secondary: {
        main: isLight ? colors.secondaryLight : colors.secondaryDark,
      },
      background: {
        default: isLight ? colors.backgroundLight : colors.backgroundDark,
        paper: isLight ? colors.paperLight : colors.paperDark,
      },
      text: {
        primary: isLight ? colors.textLight : colors.textDark,
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h4: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? colors.paperLight : colors.paperDark,
            color: isLight ? colors.textLight : colors.textDark,
            boxShadow: isLight ? colors.shadowLight : colors.shadowDark,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? colors.paperLight : colors.paperDark,
            color: isLight ? colors.textLight : colors.textDark,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
