import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, LoggerService } from '@brainrush-nx/shared';
import { firstValueFrom } from 'rxjs';
import { envs } from '../config';
import { NatsService } from '../transports/nats/nats.service';
import { LoginUserDto, RefreshTokenDto, RegisterUserDto } from './dto';
import { AxiosError } from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly natsService: NatsService, // Inyección del servicio NATS
    private readonly logger: LoggerService,
  ) { }

  /**
   * Registra un nuevo usuario a través del Auth Service
   */  async register(registerDto: RegisterUserDto) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`http://${envs.AUTH_SERVICE_HOST}:${envs.AUTH_SERVICE_PORT}/auth/register`, registerDto)
      );
      return data;    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      this.logger.error('AuthGatewayService', `Error al registrar usuario: ${axiosError.message}`, axiosError.stack);
      // Si el error tiene una respuesta HTTP con código de estado
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const responseData = axiosError.response.data as Record<string, unknown>;
        const message = responseData?.message || 'Error al registrar usuario';

        // Propaga el mismo código de estado y mensaje
        throw new HttpException(message, statusCode);
      }

      // Error sin respuesta HTTP (ej. error de red)
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }
  /**
   * Inicia sesión a través del Auth Service
   */  async login(loginDto: LoginUserDto) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`http://${envs.AUTH_SERVICE_HOST}:${envs.AUTH_SERVICE_PORT}/auth/login`, loginDto)
      );
      return data;    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      this.logger.error('AuthGatewayService', `Error al iniciar sesión: ${axiosError.message}`, axiosError.stack);
      // Si el error tiene una respuesta HTTP con código de estado
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const responseData = axiosError.response.data as Record<string, unknown>;
        const message = responseData?.message || 'Error al iniciar sesión';

        // Propaga el mismo código de estado y mensaje
        throw new HttpException(message, statusCode);
      }

      // Error sin respuesta HTTP (ej. error de red)
      throw new InternalServerErrorException('Error al iniciar sesión');
    }
  }

  /**
   * Valida un token JWT a través del Auth Service
   */  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `http://${envs.AUTH_SERVICE_HOST}:${envs.AUTH_SERVICE_PORT}/auth/validate-token`,
          { token }
        )
      );
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error al validar token: ${axiosError.message}`, axiosError.stack);
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Refresca el token de acceso usando un refresh token
   */  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `http://${envs.AUTH_SERVICE_HOST}:${envs.AUTH_SERVICE_PORT}/auth/refresh-token`,
          refreshTokenDto
        )
      );
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error al refrescar token: ${axiosError.message}`, axiosError.stack);
      // Si el error tiene una respuesta HTTP con código de estado
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const responseData = axiosError.response.data as Record<string, unknown>;
        const message = responseData?.message || 'Error al refrescar token';

        // Propaga el mismo código de estado y mensaje
        throw new HttpException(message, statusCode);
      }

      // Error sin respuesta HTTP (ej. error de red)
      throw new InternalServerErrorException('Error al refrescar token');
    }
  }

  /**
   * Cierra la sesión del usuario revocando su refresh token
   */  async logout(refreshToken: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `http://${envs.AUTH_SERVICE_HOST}:${envs.AUTH_SERVICE_PORT}/auth/logout`,
          { refreshToken }
        )
      );
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error al cerrar sesión: ${axiosError.message}`, axiosError.stack);
      // Si el error tiene una respuesta HTTP con código de estado
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const responseData = axiosError.response.data as Record<string, unknown>;
        const message = responseData?.message || 'Error al cerrar sesión';

        // Propaga el mismo código de estado y mensaje
        throw new HttpException(message, statusCode);
      }

      // Error sin respuesta HTTP (ej. error de red)
      throw new InternalServerErrorException('Error al cerrar sesión');
    }
  }
}
