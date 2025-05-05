import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RefreshTokenDto, RegisterUserDto } from './dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from './guards';
import { CurrentUser, Roles } from './decorators';
import { JwtPayload, UserRole } from '@brainrush-nx/shared';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registro de nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos o usuario ya existe' })
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    this.logger.log(`Registrando usuario: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Inicio de sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    this.logger.log(`Intento de inicio de sesión: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Refrescar token de acceso usando refresh token' })
  @ApiResponse({ status: 200, description: 'Token de acceso refrescado correctamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log('Solicitando refresh de token');
    return this.authService.refreshToken(refreshTokenDto);
  }

  @ApiOperation({ summary: 'Cerrar sesión y revocar refresh token' })
  @ApiResponse({ status: 204, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    this.logger.log('Solicitud de cierre de sesión');
    return this.authService.logout(refreshToken);
  }

  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  @ApiResponse({ status: 200, description: 'Información del usuario obtenida correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @ApiOperation({ summary: 'Acceso solo para administradores' })
  @ApiResponse({ status: 200, description: 'Acceso permitido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido - Rol insuficiente' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin')
  async adminAccess() {
    return { message: 'Tienes acceso a contenido de administrador' };
  }

  @ApiOperation({ summary: 'Acceso solo para estudiantes' })
  @ApiResponse({ status: 200, description: 'Acceso permitido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido - Rol insuficiente' })
  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('student')
  async studentAccess() {
    return { message: 'Tienes acceso a contenido de estudiante' };
  }
}
