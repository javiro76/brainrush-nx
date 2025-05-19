// src/hooks/useAuthNotifications.ts
import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { isActionOf } from '../utils/redux';
import { registerFailure, registerSuccess } from '../store/slices/auth/auth.actions';


/**
 * Hook personalizado para manejar las notificaciones relacionadas con el proceso de registro de usuarios.
 *
 * @module hooks/useRegisterNotifications
 * @description Este hook gestiona la lógica de mostrar notificaciones al usuario basadas en
 * el resultado de las operaciones de registro (éxito o diferentes tipos de errores).
 *
 * @param {Object} result - El objeto de resultado proveniente del estado Redux de autenticación.
 * @param {string|undefined} result.actionType - Tipo de acción que generó el resultado.
 * @param {boolean} [result.isNetworkError] - Indica si ocurrió un error de red.
 * @param {number} [result.statusCode] - Código de estado HTTP de la respuesta.
 * @param {string} [result.messageUser] - Mensaje de error formateado para el usuario.
 *
 * @returns {void} No retorna un valor, pero muestra notificaciones según el resultado:
 * - Muestra advertencias (warning) para problemas de conexión o errores 400
 * - Muestra errores (error) para errores de servidor u otros problemas
 * - Muestra mensajes de éxito (success) cuando el registro es exitoso
 *
 * @example
 * En un componente de registro
 * function RegisterPage() {
 *   const { result } = useAppSelector(state => state.auth);
 *   useRegisterNotifications(result);
 *   ...resto del componente
 * }
 */
export const useRegisterNotifications = (result: any) => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (isActionOf(result.actionType, registerFailure)) {
      if (result.isNetworkError) {
        enqueueSnackbar('Problema de conexión. Verifica tu internet y vuelve a intentarlo.', {
          variant: 'warning'
        });
      } else if (result.statusCode === 400) {
        enqueueSnackbar(result.messageUser || "usuario existente", { variant: 'warning' });
      } else if (result.statusCode) {
        enqueueSnackbar('Error interno del servidor. Intenta más tarde.', {
          variant: 'error'
        });
      } else {
        enqueueSnackbar('Error durante el registro. Por favor intenta nuevamente.', {
          variant: 'error'
        });
      }
    } else if (isActionOf(result.actionType, registerSuccess)) {
      enqueueSnackbar('Registro satisfactorio, redirigiendo...', {
        variant: 'success'
      });
    }
  }, [result, enqueueSnackbar]);
};
