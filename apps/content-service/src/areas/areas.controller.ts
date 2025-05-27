import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto, UpdateAreaDto } from './dto';

@Controller('areas')
export class AreasController {
  private readonly logger = new Logger('AreasController');

  constructor(private readonly areasService: AreasService) { }

  @Post()
  create(@Body() createAreaDto: CreateAreaDto) {
    this.logger.log(`Creando nueva área: ${createAreaDto.nombre}`);
    return this.areasService.create(createAreaDto);
  }

  @Get()
  findAll() {
    this.logger.log('Obteniendo todas las áreas');
    return this.areasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`Buscando área con ID: ${id}`);
    return this.areasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    this.logger.log(`Actualizando área con ID: ${id}`);
    return this.areasService.update(id, updateAreaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(`Eliminando área con ID: ${id}`);
    return this.areasService.remove(id);
  }
}
