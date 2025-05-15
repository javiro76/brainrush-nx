/**
 * Acciones para el feature de autenticación
 */
import { createAction } from '@reduxjs/toolkit';
import { LoginCredentials, RegisterData } from '../../../types/auth.types';

// Namespace para las acciones
const AUTH_NAMESPACE = 'auth';

// Login actions
export const loginRequest = createAction<LoginCredentials>(`${AUTH_NAMESPACE}/loginRequest`);
export const loginSuccess = createAction<any>(`${AUTH_NAMESPACE}/loginSuccess`);
export const loginFailure = createAction<string>(`${AUTH_NAMESPACE}/loginFailure`);

// Register actions
export const registerRequest = createAction<RegisterData>(`${AUTH_NAMESPACE}/registerRequest`);
export const registerSuccess = createAction<any>(`${AUTH_NAMESPACE}/registerSuccess`);
export const registerFailure = createAction<string>(`${AUTH_NAMESPACE}/registerFailure`);

// Logout actions
export const logoutRequest = createAction(`${AUTH_NAMESPACE}/logoutRequest`);
export const logoutSuccess = createAction(`${AUTH_NAMESPACE}/logoutSuccess`);
export const logoutFailure = createAction<string>(`${AUTH_NAMESPACE}/logoutFailure`);

// Other actions
export const clearError = createAction(`${AUTH_NAMESPACE}/clearError`);
export const setCredentials = createAction<{ user: any; token: string; refreshToken: string }>(`${AUTH_NAMESPACE}/setCredentials`);
