/**
 * Slice para el manejo del tema
 */
import { createReducer } from '@reduxjs/toolkit';
import { PaletteMode } from '@mui/material';
import { ThemeState } from '../../../types/theme.types';
import * as actions from './theme.actions';

// Obtener el tema del local storage o usar el tema claro como predeterminado
const getInitialTheme = (): PaletteMode => {
  // Intentar obtener el tema guardado
  const savedTheme = localStorage.getItem('theme') as PaletteMode | null;

  // Si no hay tema guardado, verificar preferencias del sistema
  if (!savedTheme) {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  return savedTheme === 'dark' ? 'dark' : 'light';
};

// Estado inicial
const initialState: ThemeState = {
  mode: getInitialTheme(),
};

// Reducer
const themeReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(actions.toggleThemeMode, (state) => {
      // Cambiar el tema de claro a oscuro o viceversa
      const newMode = state.mode === 'light' ? 'dark' : 'light';

      // Guardar en localStorage
      localStorage.setItem('theme', newMode);

      // Actualizar estado
      state.mode = newMode;
    })
    .addCase(actions.setThemeMode, (state, action) => {
      // Validar que el modo sea válido
      const validMode = action.payload === 'dark' ? 'dark' : 'light';

      // Guardar en localStorage
      localStorage.setItem('theme', validMode);

      // Actualizar estado
      state.mode = validMode;
    });
});

export default themeReducer;
