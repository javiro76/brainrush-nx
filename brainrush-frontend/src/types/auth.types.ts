/**
 * Tipos relacionados con la autenticación
 */

// Información del usuario
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Credenciales para iniciar sesión
export interface LoginCredentials {
  email: string;
  password: string;
}

// Datos para registro de usuario
export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

// Respuesta de autenticación de la API
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Estado del slice de autenticación
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
