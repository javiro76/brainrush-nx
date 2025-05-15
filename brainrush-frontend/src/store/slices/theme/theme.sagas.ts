/**
 * Sagas para el manejo del tema
 */
import { takeLatest, put } from 'redux-saga/effects';
import * as actions from './theme.actions';

/**
 * Saga principal para el tema
 * Escucha las acciones relacionadas con el tema y ejecuta las sagas correspondientes
 */
export function* themeSagas() {
  // Aquí podríamos agregar sagas específicas si necesitáramos
  // operaciones asíncronas relacionadas con el tema,
  // como guardar preferencias en un backend, por ejemplo.
}
