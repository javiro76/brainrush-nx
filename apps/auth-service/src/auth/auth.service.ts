import { BadRequestException, Injectable, Logger, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload, UserRole } from '@brainrush-nx/shared';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { NatsService } from '../nats/nats.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly natsService: NatsService,
  ) {}

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

      // Emitir evento de registro de usuario a través de NATS
      this.emitUserRegistered(newUser);

      return {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role as UserRole,
        },
      };
    } catch (error) {
      this.logger.error(`Error al registrar usuario: ${error.message}`, error.stack);
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

      // Emitir evento de login a través de NATS
      this.emitUserLoggedIn(user);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        },
      };
    } catch (error) {
      this.logger.error(`Error al iniciar sesión: ${error.message}`, error.stack);
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
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Genera un token JWT
   */
  private async generateJwtToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * Emite evento cuando un usuario se registra
   */
  private emitUserRegistered(user: any) {
    try {
      this.natsService.emitUserRegistered({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
      this.logger.log(`Evento user.registered emitido para ${user.email}`);
    } catch (error) {
      this.logger.error(`Error al emitir evento user.registered: ${error.message}`);
    }
  }

  /**
   * Emite evento cuando un usuario inicia sesión
   */
  private emitUserLoggedIn(user: any) {
    try {
      this.natsService.emitUserLoggedIn({
        id: user.id,
        email: user.email
      });
      this.logger.log(`Evento user.logged_in emitido para ${user.email}`);
    } catch (error) {
      this.logger.error(`Error al emitir evento user.logged_in: ${error.message}`);
    }
  }
}
