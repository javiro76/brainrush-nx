/**
 * Root Saga
 * Combina todas las sagas de la aplicación
 */
import { all, fork } from 'redux-saga/effects';
import { authSagas } from './slices/auth/auth.sagas';
import { themeSagas } from './slices/theme/theme.sagas';

/**
 * Saga principal que agrupa todas las sagas de la aplicación
 * A medida que la aplicación crezca, se agregarán más sagas aquí
 */
export default function* rootSaga() {
  yield all([
    fork(authSagas),
    fork(themeSagas),
    // Aquí se añadirán más sagas a medida que se desarrollen
  ]);
}
