/**
 * Acciones para el manejo del tema
 */
import { createAction } from '@reduxjs/toolkit';
import { PaletteMode } from '@mui/material';

export const toggleThemeMode = createAction('theme/toggleThemeMode');
export const setThemeMode = createAction<PaletteMode>('theme/setThemeMode');
