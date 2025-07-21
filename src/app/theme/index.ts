import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import type { PaletteMode, Shadows } from '@mui/material';

// Cores da identidade AutoPass
const autopassColors = {
  // Gradientes principais (tema escuro)
  bgGradient: {
    start: '#2A2E3A',
    end: '#2A2939',
  },
  darkGradient: {
    start: '#662383',
    end: '#17081D',
  },
  // Cor principal dos botões (tema escuro)
  buttonColor: '#6750A4',
  // Variações derivadas para melhor usabilidade
  buttonColorLight: '#8A7BC8',
  buttonColorDark: '#4A3A80',

  // Cores para tema claro
  lightTheme: {
    primary: '#60c1c6', // Nova cor principal para tema claro
    primaryLight: '#85D1D5',
    primaryDark: '#4A9A9E',
  },
};

// Paleta base para temas escuros
const darkPalette = {
  primary: {
    main: autopassColors.buttonColor, // #6750A4
    light: autopassColors.buttonColorLight, // #8A7BC8
    dark: autopassColors.buttonColorDark, // #4A3A80
    contrastText: '#fff',
  },
  secondary: {
    main: '#662383', // Cor do gradiente da toolbar
    light: '#8A4BAE',
    dark: '#4A1A61',
    contrastText: '#fff',
  },
  background: {
    default: autopassColors.bgGradient.start, // #2A2E3A
    paper: '#ffffff', // Mantém branco para componentes MUI
  },
};

// Paleta para tema claro
const lightPalette = {
  primary: {
    main: autopassColors.lightTheme.primary, // #60c1c6
    light: autopassColors.lightTheme.primaryLight, // #85D1D5
    dark: autopassColors.lightTheme.primaryDark, // #4A9A9E
    contrastText: '#fff',
  },
  secondary: {
    main: '#60c1c6', // Mesma cor como secundária
    light: '#85D1D5',
    dark: '#4A9A9E',
    contrastText: '#fff',
  },
  background: {
    default: '#f5f5f5', // Fundo claro
    paper: '#ffffff', // Componentes brancos
  },
};

// Cores comuns para ambos os temas
const commonColors = {
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#fff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#fff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#fff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#fff',
  },
};

// Tipografia personalizada
const typography = {
  fontFamily: [
    '"Inter"',
    '"Roboto"',
    '"Helvetica"',
    '"Arial"',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 500,
  },
};

// Breakpoints personalizados
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// Espaçamento personalizado
const spacing = 8; // 8px base

// Sombras personalizadas
const shadows = [
  'none',
  '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
  '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
  '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
  '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
  '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
];

// Configuração base do tema
const baseThemeOptions: ThemeOptions = {
  typography,
  breakpoints,
  spacing,
  shadows: shadows as Shadows,
  shape: {
    borderRadius: 8,
  },
  components: {
    // Personalização do AppBar com gradiente da AutoPass
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${autopassColors.darkGradient.start} 0%, ${autopassColors.darkGradient.end} 100%)`,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
          color: '#ffffff',
        },
      },
    },
    // Personalização do Drawer
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: '2px 0px 4px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff', // Mantém branco para legibilidade
        },
      },
    },
    // Personalização dos Cards - mantém fundo branco
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            boxShadow: `0px 4px 16px rgba(103, 80, 164, 0.2)`, // Sombra com cor primária
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // Personalização dos Buttons com cores AutoPass
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          backgroundColor: autopassColors.buttonColor, // #6750A4
          color: '#ffffff',
          boxShadow: '0px 2px 4px rgba(103, 80, 164, 0.3)',
          '&:hover': {
            backgroundColor: autopassColors.buttonColorLight, // #8A7BC8
            boxShadow: '0px 4px 8px rgba(103, 80, 164, 0.4)',
          },
        },
      },
    },
    // Personalização do CssBaseline para fundo da aplicação
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(135deg, ${autopassColors.bgGradient.start} 0%, ${autopassColors.bgGradient.end} 100%)`,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    // Personalização dos Chips
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          fontWeight: 500,
        },
      },
    },
    // Personalização das ListItems
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: `${autopassColors.buttonColor}20`, // #6750A4 com transparência
            color: autopassColors.buttonColor,
            '&:hover': {
              backgroundColor: `${autopassColors.buttonColor}30`,
            },
          },
        },
      },
    },
    // Personalização dos Alerts
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
};

// Tema claro com cores AutoPass
const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'light' as PaletteMode,
    ...lightPalette,
    ...commonColors,
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  components: {
    ...baseThemeOptions.components,
    // AppBar com gradiente claro
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${autopassColors.lightTheme.primary} 0%, ${autopassColors.lightTheme.primaryDark} 100%)`,
          boxShadow: '0px 2px 8px rgba(96, 193, 198, 0.3)',
          color: '#ffffff',
        },
      },
    },
    // CssBaseline para fundo claro
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(135deg, #f5f5f5 0%, #e8f4f8 100%)`,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
  },
});

// Tema escuro com cores AutoPass
const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'dark' as PaletteMode,
    ...darkPalette,
    ...commonColors,
    background: {
      default: autopassColors.bgGradient.end, // Versão mais escura do gradiente
      paper: '#2A2E3A', // Fundo escuro para componentes
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    ...baseThemeOptions.components,
    // AppBar mantém o mesmo gradiente em ambos os temas
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${autopassColors.darkGradient.start} 0%, ${autopassColors.darkGradient.end} 100%)`,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
          color: '#ffffff',
        },
      },
    },
    // Cards com contraste adequado para tema escuro
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E2329', // Fundo mais escuro para contraste
          color: '#ffffff', // Texto branco para contraste
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)', // Borda sutil
          transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            boxShadow: `0px 4px 16px rgba(103, 80, 164, 0.3)`, // Sombra com cor primária
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // Drawer escuro
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2A2E3A', // Cor do fundo gradiente
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    // CssBaseline para fundo escuro
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(135deg, ${autopassColors.bgGradient.end} 0%, #1A1D26 100%)`, // Gradiente ainda mais escuro
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
export default lightTheme;
