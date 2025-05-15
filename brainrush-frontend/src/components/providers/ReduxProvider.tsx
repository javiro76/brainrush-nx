import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';

interface ReduxProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de Redux
 *
 * Este componente envuelve toda la aplicación y proporciona acceso al store de Redux.
 */
export const ReduxProvider = ({ children }: ReduxProviderProps) => {
  return <Provider store={store}>{children}</Provider>;
};
