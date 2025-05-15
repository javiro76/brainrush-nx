import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useRedux';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Componente para rutas protegidas
 *
 * Redirecciona a la página de login si el usuario no está autenticado
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Verificar si el usuario está autenticado
  const { token } = useAppSelector(state => state.auth);

  // Redireccionar a login si no hay token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, mostrar los hijos
  return <>{children}</>;
};

export default ProtectedRoute;
