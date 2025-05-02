import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthResponse, AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  createHttp(@Body() createAuthDto: CreateAuthDto): Promise<AuthResponse> {
    return this.authService.create(createAuthDto);
  }

  @Get()
  findAllHttp() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOneHttp(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Put(':id')
  updateHttp(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  removeHttp(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  // Métodos originales para comunicación mediante NATS
  @MessagePattern('createAuth')
  create(@Payload() createAuthDto: CreateAuthDto): Promise<AuthResponse> {
    return this.authService.create(createAuthDto);
  }

  @MessagePattern('findAllAuth')
  findAll() {
    return this.authService.findAll();
  }

  @MessagePattern('findOneAuth')
  findOne(@Payload() id: number) {
    return this.authService.findOne(id);
  }

  @MessagePattern('updateAuth')
  update(@Payload() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(updateAuthDto.id, updateAuthDto);
  }

  @MessagePattern('removeAuth')
  remove(@Payload() id: number) {
    return this.authService.remove(id);
  }
}
