/**
 * Configuración base para Axios
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// URL base de la API
console.log('🔧 Environment variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NODE_ENV: process.env.NODE_ENV
});

export const BASE_API_URL = process.env.REACT_APP_API_URL || '/api';

console.log('🌐 Using API Base URL:', BASE_API_URL);

// Clase base para los servicios API
export class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: BASE_API_URL,
      timeout: 10000, // 10 segundos
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor para añadir token a las peticiones
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );    // Interceptor para manejar errores de respuesta
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // No intentar refrescar el token en endpoints de login o registro
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register');

        // Si el error es 401 (No autorizado), no es un endpoint de auth y no se ha intentado refrescar el token
        if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log('Intentando refrescar token para:', originalRequest.url);

          try {
            // Intenta refrescar el token
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(
              `${BASE_API_URL}/auth/refresh-token`,
              { refreshToken }
            );

            const { token, refreshToken: newRefreshToken } = response.data;

            // Guardar nuevos tokens
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Actualizar el token en la petición original y reintentarla
            originalRequest.headers.Authorization = `Bearer ${token}`; return this.api(originalRequest);
          } catch (refreshError) {
            // Si no se puede refrescar el token, limpiar localStorage y redirigir a login
            console.error('Error al refrescar token:', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            if (this.redirectToLogin) {
              this.redirectToLogin();
            } else {
              console.error('Redirect function not set. Cannot redirect to login.');
            }
            return Promise.reject(refreshError);
          }
        }

        // Para errores 401 en endpoints de auth, pasar el error original sin modificar
        if (error.response?.status === 401 && (originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register'))) {
          console.log('Error 401 en endpoint de autenticación, pasando error original');
        }

        return Promise.reject(error);
      }
    );
  }

  // Patrón Singleton para obtener instancia
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Método para obtener la instancia de Axios
  public getAxios(): AxiosInstance {
    return this.api;
  }

  // Métodos HTTP básicos
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  // Agregar una propiedad para almacenar la función de redirección
  private redirectToLogin: (() => void) | null = null;

  // Método para configurar la función de redirección
  public setRedirectToLogin(redirectFn: () => void): void {
    this.redirectToLogin = redirectFn;
  }

  // Método estático para configurar la función de redirección
  public static setRedirectToLogin(redirectFn: () => void): void {
    ApiService.getInstance().setRedirectToLogin(redirectFn);
  }
}

// Exportar la clase ApiService como exportación predeterminada
export default ApiService;
