import { Body, Controller, Post, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RefreshTokenDto, RegisterUserDto } from './dto';
import { AuthResponse } from './interfaces/auth-response.interface';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterUserDto): Promise<AuthResponse> {
    this.logger.log(`Registrando usuario: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto): Promise<AuthResponse> {
    this.logger.log(`Intento de inicio de sesión: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @Post('validate-token')
  async validateToken(@Body('token') token: string) {
    this.logger.log('Validando token JWT');
    return this.authService.validateToken(token);
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    this.logger.log('Solicitando refresh de token');
    return this.authService.refreshAccessToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    this.logger.log('Solicitud de cierre de sesión');
    return this.authService.logout(refreshToken);
  }
}
