import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoggerService } from '../common/logger.service';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  private readonly context = 'AuthController';

  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService
  ) {
    this.logger.log(this.context, 'Controlador de autenticación inicializado');
  }

  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @Post()
  async create(@Body() createAuthDto: CreateAuthDto) {
    this.logger.log(this.context, `Solicitud de creación de usuario recibida: ${createAuthDto.email}`);
    const result = await this.authService.create(createAuthDto);
    this.logger.log(this.context, `Respuesta enviada para creación de usuario: ${createAuthDto.email}`);
    return result;
  }

  @Get()
  async findAll() {
    this.logger.log(this.context, 'Solicitud para obtener todos los usuarios');
    const result = await this.authService.findAll();
    this.logger.log(this.context, 'Respuesta enviada con la lista de usuarios');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(this.context, `Solicitud para obtener usuario con ID: ${id}`);
    const result = await this.authService.findOne(+id);
    this.logger.log(this.context, `Respuesta enviada para el usuario ID: ${id}`);
    return result;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    this.logger.log(this.context, `Solicitud para actualizar usuario ID: ${id}`);
    const result = await this.authService.update(+id, updateAuthDto);
    this.logger.log(this.context, `Respuesta enviada para actualización de usuario ID: ${id}`);
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(this.context, `Solicitud para eliminar usuario ID: ${id}`);
    const result = await this.authService.remove(+id);
    this.logger.log(this.context, `Respuesta enviada para eliminación de usuario ID: ${id}`);
    return result;
  }
}
