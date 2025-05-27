import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LoggerService } from '@brainrush-nx/shared';
import { AreasService } from './areas.service';
import { CreateAreaDto, UpdateAreaDto } from './dto';

@Controller('areas')
export class AreasController {
  constructor(
    private readonly areasService: AreasService,
    private readonly logger: LoggerService
  ) { }

  @Post()
  create(@Body() createAreaDto: CreateAreaDto) {
    this.logger.log('AreasController', `Creando nueva área: ${createAreaDto.nombre}`);
    return this.areasService.create(createAreaDto);
  }

  @Get()
  findAll() {
    this.logger.log('AreasController', 'Obteniendo todas las áreas');
    return this.areasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log('AreasController', `Buscando área con ID: ${id}`);
    return this.areasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    this.logger.log('AreasController', `Actualizando área con ID: ${id}`);
    return this.areasService.update(id, updateAreaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log('AreasController', `Eliminando área con ID: ${id}`);
    return this.areasService.remove(id);
  }
}
