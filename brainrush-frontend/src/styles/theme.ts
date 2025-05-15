import { createTheme, ThemeOptions, PaletteOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Definiendo las opciones de paleta para el tema claro
const lightPaletteOptions: PaletteOptions = {
  mode: 'light',
  primary: {
    main: 'hsl(280, 84%, 60%)', // Púrpura/Violeta vibrante
    light: 'hsl(280, 84%, 70%)',
    dark: 'hsl(280, 84%, 50%)',
    contrastText: '#fff',
  },
  secondary: {
    main: 'hsl(47, 100%, 50%)', // Amarillo brillante
    light: 'hsl(47, 100%, 65%)',
    dark: 'hsl(47, 100%, 40%)',
    contrastText: 'hsl(280, 10%, 15%)', // Texto oscuro para contraste con amarillo
  },
  info: {
    main: 'hsl(169, 100%, 39%)', // Verde azulado/Turquesa
    light: 'hsl(169, 100%, 49%)',
    dark: 'hsl(169, 100%, 29%)',
    contrastText: '#fff',
  },
  success: {
    main: 'hsl(145, 83%, 42%)', // Verde Emerald
    light: 'hsl(145, 83%, 52%)',
    dark: 'hsl(145, 83%, 32%)',
    contrastText: '#fff',
  },
  error: {
    main: '#f44336', // Rojo estándar de Material UI
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#fff',
  },
  warning: {
    main: 'hsl(36, 100%, 50%)', // Ámbar
    light: 'hsl(36, 100%, 60%)',
    dark: 'hsl(36, 100%, 40%)',
    contrastText: 'hsl(280, 10%, 15%)',
  },
  background: {
    default: 'hsl(280, 75%, 98%)', // Fondo muy claro púrpura
    paper: '#fff',
  },
  text: {
    primary: 'hsl(280, 10%, 15%)', // Texto principal oscuro púrpura
    secondary: 'hsl(280, 5%, 45%)', // Texto secundario gris púrpura
  },
};

// Definiendo las opciones de paleta para el tema oscuro
const darkPaletteOptions: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: 'hsl(280, 84%, 60%)', // Mantenemos el púrpura como color principal
    light: 'hsl(280, 84%, 70%)',
    dark: 'hsl(280, 84%, 50%)',
    contrastText: '#fff',
  },
  secondary: {
    main: 'hsl(47, 100%, 50%)', // Amarillo brillante
    light: 'hsl(47, 100%, 65%)',
    dark: 'hsl(47, 100%, 40%)',
    contrastText: '#000',
  },
  info: {
    main: 'hsl(169, 100%, 39%)', // Verde azulado/Turquesa
    light: 'hsl(169, 100%, 49%)',
    dark: 'hsl(169, 100%, 29%)',
    contrastText: '#fff',
  },
  success: {
    main: 'hsl(145, 83%, 42%)', // Verde Emerald
    light: 'hsl(145, 83%, 52%)',
    dark: 'hsl(145, 83%, 32%)',
    contrastText: '#fff',
  },
  error: {
    main: '#f44336', // Rojo estándar de Material UI
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#fff',
  },
  warning: {
    main: 'hsl(36, 100%, 50%)', // Ámbar
    light: 'hsl(36, 100%, 60%)',
    dark: 'hsl(36, 100%, 40%)',
    contrastText: '#000',
  },
  background: {
    default: 'hsl(280, 15%, 15%)', // Fondo oscuro con un toque púrpura
    paper: 'hsl(280, 15%, 20%)', // Un poco más claro para elementos de papel
  },
  text: {
    primary: '#fff',
    secondary: 'rgba(255, 255, 255, 0.7)',
  },
};

// Opciones comunes para ambos temas
const commonOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Poppins", "Nunito", "Baloo", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Botones sin texto en mayúsculas
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Bordes más redondeados para una apariencia amigable
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30, // Botones muy redondeados (estilo "pill")
          padding: '10px 20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Cards más redondeadas
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Chips muy redondeados
        },
      },
    },
    // Podemos agregar más personalizaciones de componentes aquí
  },
};

// Función para crear el tema basado en el modo (claro u oscuro)
export const createAppTheme = (mode: PaletteMode = 'light') => {
  return createTheme({
    ...commonOptions,
    palette: mode === 'light' ? lightPaletteOptions : darkPaletteOptions,
  });
};

// Exportamos ambas versiones del tema para uso inmediato
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');

// Exportamos el tema por defecto (claro)
export default lightTheme;
