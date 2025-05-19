// src/hooks/useAuthNotifications.ts
import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { isActionOf } from '../utils/redux';
import { loginFailure, loginSuccess } from '../store/slices/auth/auth.actions';


/**
 * Hook para mostrar notificaciones durante el proceso de inicio de sesión.
 *
 * @param {Object} result - El resultado de la acción de autenticación del estado Redux.
 *   - actionType: Identifica el tipo de acción ocurrida.
 *   - isNetworkError: Indica si hubo un problema de conexión.
 *   - statusCode: Código HTTP de la respuesta (401, 500, etc).
 *   - messageUser: Mensaje de error para mostrar al usuario.
 *
 * @returns {void} No retorna valor, pero muestra notificaciones según el resultado:
 *   - Warning: Para problemas de conexión o credenciales incorrectas
 *   - Error: Para errores internos del servidor
 *   - Success: Cuando el inicio de sesión es exitoso
 *
 * @example
 * function LoginPage() {
 *   const { result } = useAppSelector(state => state.auth);
 *   useLoginNotifications(result);
 * }
 */
export const useLoginNotifications = (result: any) => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Si result es undefined o no tiene actionType, no hacemos nada
    if (!result || !result.actionType) return;

    console.log('Resultado de login:', result);

    if (isActionOf(result.actionType, loginFailure)) {
      if (result.isNetworkError) {
        enqueueSnackbar('Problema de conexión. Verifica tu internet y vuelve a intentarlo.', {
          variant: 'warning'
        });
      } else if (result.statusCode === 401) {
        // Para errores de credenciales (401)
        enqueueSnackbar(result.messageUser || "Credenciales incorrectas", {
          variant: 'warning'
        });
      } else if (result.statusCode === 400) {
        // Para errores de validación (400)
        enqueueSnackbar(result.messageUser || "Datos de inicio de sesión inválidos", {
          variant: 'warning'
        });
      } else if (result.statusCode) {
        // Para otros errores con código de estado
        console.log('Error de autenticación:', result.statusCode, result.messageUser);
        enqueueSnackbar(result.messageUser || 'Error interno del servidor. Intenta más tarde.', {
          variant: 'error'
        });
      } else {
        // Errores sin código de estado
        enqueueSnackbar('Error en inicio de sesión. Por favor intenta nuevamente.', {
          variant: 'error'
        });
      }
    } else if (isActionOf(result.actionType, loginSuccess)) {
      enqueueSnackbar('Inicio de sesión correcto, redirigiendo...', {
        variant: 'success'
      });
    }
  }, [result, enqueueSnackbar]);
};
