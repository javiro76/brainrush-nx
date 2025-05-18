import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@brainrush-nx/shared';
import { firstValueFrom } from 'rxjs';
import { envs } from '../config';
import { NatsService } from '../transports/nats/nats.service';
import { RefreshTokenDto, RegisterUserDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthGatewayService');

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly natsService: NatsService, // Inyección del servicio NATS
  ) {}

  /**
   * Registra un nuevo usuario a través del Auth Service
   */
  async register(registerDto: RegisterUserDto) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`http://${envs.authServiceHost}:${envs.authServicePort}/auth/register`, registerDto)
      );
      return data;
    } catch (error) {
      this.logger.error(`Error al registrar usuario: ${error.message}`, error.stack);
      throw error.response?.data || new Error('Error al registrar usuario');
    }
  }

  /**
   * Inicia sesión a través del Auth Service
   */
  async login(loginDto: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`http://${envs.authServiceHost}:${envs.authServicePort}/auth/login`, loginDto)
      );
      return data;
    } catch (error) {
      this.logger.error(`Error al iniciar sesión: ${error.message}`, error.stack);
      throw error.response?.data || new Error('Error al iniciar sesión');
    }
  }

  /**
   * Valida un token JWT a través del Auth Service
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `http://${envs.authServiceHost}:${envs.authServicePort}/auth/validate-token`,
          { token }
        )
      );
      return data;
    } catch (error) {
      this.logger.error(`Error al validar token: ${error.message}`, error.stack);
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Refresca el token de acceso usando un refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `http://${envs.authServiceHost}:${envs.authServicePort}/auth/refresh-token`,
          refreshTokenDto
        )
      );
      return data;
    } catch (error) {
      this.logger.error(`Error al refrescar token: ${error.message}`, error.stack);
      throw error.response?.data || new UnauthorizedException('Error al refrescar token');
    }
  }

  /**
   * Cierra la sesión del usuario revocando su refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `http://${envs.authServiceHost}:${envs.authServicePort}/auth/logout`,
          { refreshToken }
        )
      );
    } catch (error) {
      this.logger.error(`Error al cerrar sesión: ${error.message}`, error.stack);
      throw error.response?.data || new Error('Error al cerrar sesión');
    }
  }
}
