/**
 * Utilidades para testing de React con Material UI
 * 
 * Este archivo contiene:
 * - Función customRender para renderizar componentes con ThemeProvider
 * - Re-exports de React Testing Library con configuración personalizada
 * - Helpers para testing de componentes MUI
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

// Tema básico para testing (simplificado)
const testTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

/**
 * Provider wrapper que incluye todas las dependencias necesarias para testing
 * @param children - Componentes children a renderizar
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={testTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

/**
 * Función personalizada de render que incluye providers necesarios para MUI
 * @param ui - Componente a renderizar
 * @param options - Opciones adicionales de render
 * @returns Resultado del render con utilidades de testing
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export de todas las utilidades de testing
export * from '@testing-library/react';
export { customRender as render };
