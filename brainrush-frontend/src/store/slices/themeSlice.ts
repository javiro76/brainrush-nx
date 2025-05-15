import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaletteMode } from '@mui/material';

// Definimos la interfaz para el estado del slice
interface ThemeState {
  mode: PaletteMode;
}

// Estado inicial
const initialState: ThemeState = {
  mode: 'light', // Por defecto, utilizamos el tema claro
};

/**
 * Slice para manejar el tema de la aplicación
 * - Permite cambiar entre tema claro y oscuro
 */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // Acción para cambiar el tema
    setThemeMode: (state, action: PayloadAction<PaletteMode>) => {
      state.mode = action.payload;
      // Opcionalmente, guardar la preferencia en localStorage
      localStorage.setItem('themeMode', action.payload);
    },

    // Acción para alternar entre tema claro y oscuro
    toggleThemeMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      // Opcionalmente, guardar la preferencia en localStorage
      localStorage.setItem('themeMode', state.mode);
    },

    // Acción para inicializar el tema desde localStorage o preferencia del sistema
    initTheme: (state) => {
      const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;

      // Si el usuario tiene una preferencia guardada, la usamos
      if (savedMode) {
        state.mode = savedMode;
      }
      // Si no, detectamos preferencia del sistema
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        state.mode = 'dark';
      }
      // Si nada de lo anterior, se mantiene el modo light establecido en initialState
    }
  },
});

// Exportamos las acciones
export const { setThemeMode, toggleThemeMode, initTheme } = themeSlice.actions;

// Exportamos el reducer
export default themeSlice.reducer;
