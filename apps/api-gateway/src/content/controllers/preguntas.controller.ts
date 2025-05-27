import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ContentService } from '../content.service';
import { JwtAuthGuard } from '../../auth/guards';
import { CreatePreguntaDto, UpdatePreguntaDto } from '../dto';

@Controller('preguntas')
export class PreguntasController {
  constructor(private readonly contentService: ContentService) { }

  @Get()
  async findAll(@Query('textoId') textoId?: string, @Query('areaId') areaId?: string) {
    return this.contentService.getAllPreguntas(textoId, areaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contentService.getPreguntaById(id);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createPreguntaDto: CreatePreguntaDto) {
    return this.contentService.createPregunta(createPreguntaDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updatePreguntaDto: UpdatePreguntaDto) {
    return this.contentService.updatePregunta(id, updatePreguntaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.contentService.deletePregunta(id);
  }
}
