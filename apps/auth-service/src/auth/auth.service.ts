import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';
import { JwtPayload, UserRole, LoggerService } from '@brainrush-nx/shared';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RefreshTokenDto, RegisterUserDto } from './dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { NatsService } from '../nats/nats.service';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly natsService: NatsService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) { }

  /**
   * Registra un nuevo usuario
   */
  async register(registerDto: RegisterUserDto): Promise<AuthResponse> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new BadRequestException(`El usuario con email ${registerDto.email} ya existe`);
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Crear el usuario
      const newUser = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          password: hashedPassword,
          role: registerDto.role || UserRole.STUDENT,
        },
      });

      // Generar token JWT
      const token = await this.generateJwtToken({
        sub: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role as UserRole,
      });

      // Generar refresh token
      const refreshToken = await this.generateRefreshToken(newUser.id);

      // Emitir evento de registro de usuario a través de NATS
      this.emitUserRegistered(newUser);

      return {
        token,
        refreshToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role as UserRole,
        },
      };    } catch (error) {
      this.logger.error('AuthService', `Error al registrar usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Inicia sesión de usuario
   */
  async login(loginDto: LoginUserDto): Promise<AuthResponse> {
    try {
      // Buscar el usuario
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      // Generar token JWT
      const token = await this.generateJwtToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      });

      // Generar refresh token
      const refreshToken = await this.generateRefreshToken(user.id);

      // Emitir evento de login a través de NATS
      this.emitUserLoggedIn(user);

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        },
      };    } catch (error) {
      this.logger.error('AuthService', `Error al iniciar sesión: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Valida el token JWT y devuelve la información del usuario
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException(`Token inválido o expirado, ${error.message}`);
    }
  }

  /**
   * Genera un token JWT
   */
  private async generateJwtToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * Genera un refresh token para un usuario y lo guarda en la base de datos
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    try {
      // Crear un token aleatorio
      const tokenValue = randomUUID();

      // Calcular la fecha de expiración (7 días)
      const expiresIn = new Date();
      expiresIn.setDate(expiresIn.getDate() + 7);

      // Guardar el token en la base de datos
      await this.prisma.refreshToken.create({
        data: {
          token: tokenValue,
          expires: expiresIn,
          userId: userId,
        },
      });

      return tokenValue;
    } catch (error) {
      this.logger.error(`Error al generar refresh token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Renueva el token de acceso usando un refresh token
   */
  async refreshAccessToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const { refreshToken } = refreshTokenDto;

      // Buscar el refresh token en la base de datos
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      // Verificar si el token existe
      if (!storedToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Verificar si el token está revocado
      if (storedToken.revoked) {
        throw new UnauthorizedException('Refresh token revocado');
      }

      // Verificar si el token ha expirado
      if (storedToken.expires < new Date()) {
        throw new UnauthorizedException('Refresh token expirado');
      }

      // Generar un nuevo access token
      const newAccessToken = await this.generateJwtToken({
        sub: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
        role: storedToken.user.role as UserRole,
      });

      return {
        token: newAccessToken,
        refreshToken,
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          name: storedToken.user.name,
          role: storedToken.user.role as UserRole,
        },
      };
    } catch (error) {
      this.logger.error(`Error al refrescar token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cierra la sesión de un usuario revocando su refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // Buscar el refresh token
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      // Si el token no existe, no hacemos nada
      if (!storedToken) {
        return;
      }

      // Revocar el token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });

      this.logger.log('AuthService', `Refresh token revocado para el usuario: ${storedToken.userId}`);
    } catch (error) {
      this.logger.error(`Error al cerrar sesión: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Revoca todos los refresh tokens de un usuario
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      // Revocar todos los tokens del usuario
      await this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });

      this.logger.log('AuthService', `Todos los refresh tokens revocados para el usuario: ${userId}`);
    } catch (error) {
      this.logger.error(`Error al revocar todos los tokens: ${error.message}`, error.stack);
      throw error;
    }
  }
  /**
   * Emite evento cuando un usuario se registra
   */
  private emitUserRegistered(user: { id: string; email: string; name: string; role: string }) {
    try {
      this.natsService.emitUserRegistered({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
      this.logger.log('AuthService', `Evento user.registered emitido para ${user.email}`);
    } catch (error) {
      this.logger.error('AuthService', `Error al emitir evento user.registered: ${error.message}`);
    }
  }

  /**
   * Emite evento cuando un usuario inicia sesión
   */
  private emitUserLoggedIn(user: { id: string; email: string }) {
    try {
      this.natsService.emitUserLoggedIn({
        id: user.id,
        email: user.email
      });
      this.logger.log('AuthService', `Evento user.logged_in emitido para ${user.email}`);
    } catch (error) {
      this.logger.error('AuthService', `Error al emitir evento user.logged_in: ${error.message}`);
    }
  }
}
