// src/theme/theme.ts
import { createTheme, PaletteMode, ThemeOptions } from '@mui/material/styles';

const colors = {
  main: '#FF6F61', // Vibrant coral
  primaryLight: '#FF8A80',
  primaryDark: '#FF3D00',
  secondaryLight: '#64B5F6',
  secondaryDark: '#01579B',
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
      fontFamily: 'Poppins, sans-serif', // Modern font
      h3: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 800,
      },
      h5: {
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
            borderRadius: 50,
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
