/**
 * Configuración base para testing con React Testing Library y MUI
 * 
 * Este archivo contiene:
 * - Configuración del entorno de testing para Material UI
 * - Helper functions para renderizar componentes con providers necesarios
 * - Mocks globales para funciones del browser
 */

import '@testing-library/jest-dom';

// Mock para matchMedia (requerido por algunos componentes de MUI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para ResizeObserver (usado por algunos componentes MUI)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock para IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
