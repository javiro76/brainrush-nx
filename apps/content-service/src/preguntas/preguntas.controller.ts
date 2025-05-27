import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LoggerService } from '@brainrush-nx/shared';
import { PreguntasService } from './preguntas.service';
import { CreatePreguntaDto, UpdatePreguntaDto } from './dto';

@ApiTags('preguntas')
@Controller('preguntas')
export class PreguntasController {
    constructor(
        private readonly preguntasService: PreguntasService,
        private readonly logger: LoggerService
    ) { }
    @Post()
    @ApiOperation({ summary: 'Crear nueva pregunta' })
    @ApiResponse({
        status: 201,
        description: 'La pregunta ha sido creada exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    create(@Body() createPreguntaDto: CreatePreguntaDto) {
        this.logger.log('PreguntasController', `Creando nueva pregunta para el área: ${createPreguntaDto.areaId}`);
        return this.preguntasService.create(createPreguntaDto);
    } @Get()
    @ApiOperation({ summary: 'Obtener listado de preguntas' })
    @ApiQuery({ name: 'textoId', required: false, description: 'Filtrar por ID de texto' })
    @ApiQuery({ name: 'areaId', required: false, description: 'Filtrar por ID de área' })
    @ApiResponse({
        status: 200,
        description: 'Lista de preguntas recuperada exitosamente'
    })
    findAll(@Query('textoId') textoId?: string, @Query('areaId') areaId?: string) {
        if (textoId) {
            this.logger.log('PreguntasController', `Obteniendo preguntas para el texto con ID: ${textoId}`);
        }
        if (areaId) {
            this.logger.log('PreguntasController', `Obteniendo preguntas para el área con ID: ${areaId}`);
        }
        if (!textoId && !areaId) {
            this.logger.log('PreguntasController', 'Obteniendo todas las preguntas');
        }

        return this.preguntasService.findAll(textoId, areaId);
    }
    @Get(':id')
    @ApiOperation({ summary: 'Obtener una pregunta por ID' })
    @ApiParam({ name: 'id', description: 'ID de la pregunta a buscar' })
    @ApiResponse({
        status: 200,
        description: 'Pregunta encontrada'
    })
    @ApiResponse({
        status: 404,
        description: 'Pregunta no encontrada'
    })
    findOne(@Param('id') id: string) {
        this.logger.log('PreguntasController', `Buscando pregunta con ID: ${id}`);
        return this.preguntasService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una pregunta existente' })
    @ApiParam({ name: 'id', description: 'ID de la pregunta a actualizar' })
    @ApiResponse({
        status: 200,
        description: 'Pregunta actualizada correctamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 404,
        description: 'Pregunta no encontrada'
    })
    update(@Param('id') id: string, @Body() updatePreguntaDto: UpdatePreguntaDto) {
        this.logger.log('PreguntasController', `Actualizando pregunta con ID: ${id}`);
        return this.preguntasService.update(id, updatePreguntaDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una pregunta' })
    @ApiParam({ name: 'id', description: 'ID de la pregunta a eliminar' })
    @ApiResponse({
        status: 200,
        description: 'Pregunta eliminada correctamente'
    })
    @ApiResponse({
        status: 404,
        description: 'Pregunta no encontrada'
    })
    remove(@Param('id') id: string) {
        this.logger.log('PreguntasController', `Eliminando pregunta con ID: ${id}`);
        return this.preguntasService.remove(id);
    }
}
