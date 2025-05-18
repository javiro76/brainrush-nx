/**
 * Servicio para operaciones relacionadas con la autenticación
 */
import { AxiosResponse } from 'axios';
import { ApiService } from './api.service';
import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth.types';

export class AuthService {
  private static _instance: AuthService;
  private apiService: ApiService;

  // Endpoints
  private loginEndpoint = '/auth/login';
  private registerEndpoint = '/auth/register';
  private logoutEndpoint = '/auth/logout';
  private refreshTokenEndpoint = '/auth/refresh-token';
  private profileEndpoint = '/auth/profile';

  private constructor() {
    this.apiService = ApiService.getInstance();
  }

  // Implementación del patrón Singleton
  public static getInstance(): AuthService {
    if (!AuthService._instance) {
      AuthService._instance = new AuthService();
    }
    return AuthService._instance;
  }

  /**
   * Inicia sesión con credenciales de usuario
   * @param credentials Credenciales de usuario (email y password)
   * @returns Respuesta con datos de autenticación
   */
   public login = (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> => {
    try {
      return this.apiService.post<AuthResponse>(this.loginEndpoint, credentials);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario
   * @param userData Datos del nuevo usuario
   * @returns Respuesta con datos de autenticación
   */
  public register(userData: RegisterData): Promise<AxiosResponse<AuthResponse>> {
    try {
      return this.apiService.post<AuthResponse>(this.registerEndpoint, userData);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario
   * @param refreshToken Token de refresco actual
   * @returns Respuesta de cierre de sesión
   */
  public logout(refreshToken: string): Promise<AxiosResponse<void>> {
    try {
      return this.apiService.post<void>(this.logoutEndpoint, { refreshToken });
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  /**
   * Refresca el token de acceso
   * @param refreshToken Token de refresco
   * @returns Respuesta con nuevos tokens
   */
  public refreshToken(refreshToken: string): Promise<AxiosResponse<{ token: string; refreshToken: string }>> {
    try {
      return this.apiService.post<{ token: string; refreshToken: string }>(
        this.refreshTokenEndpoint,
        { refreshToken }
      );
    } catch (error) {
      console.error('Error al refrescar token:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * @returns Datos del perfil del usuario
   */
  public getProfile(): Promise<AxiosResponse<any>> {
    try {
      return this.apiService.get(this.profileEndpoint);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }
}
