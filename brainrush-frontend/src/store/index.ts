import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import themeReducer from './slices/theme/theme.slice';
import authReducer from './slices/auth/auth.slice';
import rootSaga from './rootSaga';

/**
 * Configuración del middleware de Redux Saga
 */
const sagaMiddleware = createSagaMiddleware();

/**
 * Configuración del store de Redux
 * - Combina todos los reducers
 * - Configura middleware (incluyendo Redux-Saga)
 * - Habilita DevTools para desarrollo
 */
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    // Aquí irán más reducers a medida que crezcamos
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Iniciamos el rootSaga después de crear el store
sagaMiddleware.run(rootSaga);

// Exportamos los tipos del store para usarlos en toda la aplicación
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
