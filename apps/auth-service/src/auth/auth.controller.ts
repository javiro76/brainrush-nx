import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto, RefreshTokenDto, RegisterUserDto, AuthResponseDto } from './dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { LoggerService } from '@brainrush-nx/shared';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado correctamente', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos o usuario ya existe' })
  async register(@Body() registerDto: RegisterUserDto): Promise<AuthResponse> {
    this.logger.log('AuthController', `Registrando usuario: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Post('login')
  async login(@Body() loginDto: LoginUserDto): Promise<AuthResponse> {
    this.logger.log('AuthController', `Intento de inicio de sesión: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  @ApiBearerAuth()
  @Post('validate-token')
  async validateToken(@Body('token') token: string) {
    this.logger.log('AuthController', 'Validando token JWT');
    return this.authService.validateToken(token);
  } @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiResponse({ status: 200, description: 'Token renovado correctamente', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' }) @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiResponse({ status: 200, description: 'Token renovado correctamente', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    this.logger.log('AuthController', 'Solicitando refresh de token');
    return this.authService.refreshAccessToken(refreshTokenDto);
  }

  @ApiOperation({ summary: 'Cerrar sesión de usuario' })
  @ApiResponse({ status: 204, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 400, description: 'Refresh token inválido' })
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    this.logger.log('AuthController', 'Solicitud de cierre de sesión');
    return this.authService.logout(refreshToken);
  }
}
