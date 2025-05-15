/**
 * Reducer para la funcionalidad de autenticación
 */
import { createReducer } from '@reduxjs/toolkit';
import { AuthState } from '../../../types/auth.types';
import * as actions from './auth.actions';

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  status: 'idle',
  error: null,
};

// Reducer
const authReducer = createReducer(initialState, (builder) => {
  builder
    // Login reducers
    .addCase(actions.loginRequest, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(actions.loginSuccess, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;

      // Guardar en localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    })
    .addCase(actions.loginFailure, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })

    // Register reducers
    .addCase(actions.registerRequest, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(actions.registerSuccess, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;

      // Guardar en localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    })
    .addCase(actions.registerFailure, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })

    // Logout reducers
    .addCase(actions.logoutRequest, (state) => {
      state.status = 'loading';
    })
    .addCase(actions.logoutSuccess, (state) => {
      // Restablecer estado
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.status = 'idle';

      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    })
    .addCase(actions.logoutFailure, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })

    // Other reducers
    .addCase(actions.clearError, (state) => {
      state.error = null;
      state.status = 'idle';
    })
    .addCase(actions.setCredentials, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;

      // Guardar en localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    });
});

export default authReducer;
