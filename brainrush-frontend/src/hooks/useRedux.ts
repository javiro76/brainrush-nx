import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/**
 * Hooks tipados para Redux
 *
 * Estos hooks proveen tipado automático cuando se utilizan con TypeScript,
 * facilitando el acceso al store con intellisense y comprobación de tipos.
 */

// Use este hook en lugar de `useDispatch`
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Use este hook en lugar de `useSelector`
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
