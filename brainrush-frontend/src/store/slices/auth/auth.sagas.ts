/**
 * Sagas para el manejo asincrónico de operaciones de autenticación
 */
import { call, put, takeLatest } from 'redux-saga/effects';
import { AuthService } from '../../../services';
import * as actions from './auth.actions';
import { AuthResponse } from '../../../types/auth.types';
import { AxiosError, AxiosResponse } from 'axios';
import { extractErrorInfo } from '../../../utils/redux';

// Servicio de autenticación
const authService = AuthService.getInstance();

/**
 * Saga para manejar la solicitud de inicio de sesión
 */
function* loginSaga(action: ReturnType<typeof actions.loginRequest>) {
  try {
    // Realizar la llamada al servicio de autenticación
    const response: AxiosResponse<AuthResponse> = yield call(
      authService.login,
      action.payload
    );

    // Enviar acción de éxito con datos del usuario y tokens
    yield put(actions.loginSuccess(response.data));
  } catch (error: unknown) {
    // funcion que Capturar el código de estado HTTP y el mensaje de error
    const errorInfo = extractErrorInfo(error);

    // Enviar acción de error con el mensaje y código de estado
    yield put(actions.loginFailure({
      message: errorInfo.originalMessage,
      statusCode: errorInfo.statusCode,
      isNetworkError: errorInfo.isNetworkError,
    }));
  }
}

/**
 * Saga para manejar la solicitud de registro de usuario
 */
function* registerSaga(action: ReturnType<typeof actions.registerRequest>) {
  try {
    // Realizar la llamada al servicio de autenticación
    const response: AxiosResponse<AuthResponse> = yield call(
      authService.register,
      action.payload
    );

    // Enviar acción de éxito con datos del usuario y tokens
    yield put(actions.registerSuccess(response.data));

  } catch (error: unknown) {

    // funcion que Capturar el código de estado HTTP y el mensaje de error
    const errorInfo = extractErrorInfo(error);

    // Enviar acción de error con el mensaje y código de estado
    yield put(actions.registerFailure({
      message: errorInfo.originalMessage,
      statusCode: errorInfo.statusCode,
      isNetworkError: errorInfo.isNetworkError,
    }));
  }
}

/**
 * Saga para manejar la solicitud de cierre de sesión
 */
function* logoutSaga(action: ReturnType<typeof actions.logoutRequest>) {
  try {
    // Obtener el token de refresco del estado (esto requerirá una modificación si no está disponible)
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      // Realizar la llamada al servicio de autenticación
      yield call(
        authService.logout.bind(authService),
        refreshToken
      );
    }

    // Enviar acción de éxito para limpiar el estado
    yield put(actions.logoutSuccess());
  } catch (error: unknown) {
    // funcion que Capturar el código de estado HTTP y el mensaje de error
    const errorInfo = extractErrorInfo(error);

    // Enviar acción de error con el mensaje y código de estado
    yield put(actions.logoutFailure({
      message: errorInfo.originalMessage,
      statusCode: errorInfo.statusCode,
      isNetworkError: errorInfo.isNetworkError,
    }));

    // Intentar limpiar el estado de todas formas
    yield put(actions.logoutSuccess());
  }
}

/**
 * Saga principal para autenticación
 * Escucha las acciones relacionadas con autenticación y ejecuta las sagas correspondientes
 */
export function* authSagas() {
  yield takeLatest(actions.loginRequest.type, loginSaga);
  yield takeLatest(actions.registerRequest.type, registerSaga);
  yield takeLatest(actions.logoutRequest.type, logoutSaga);
}
