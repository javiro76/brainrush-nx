import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OpcionesService } from './opciones.service';
import { CreateOpcionDto, UpdateOpcionDto } from './dto';

@ApiTags('opciones')
@Controller('opciones')
export class OpcionesController {
    private readonly logger = new Logger('OpcionesController');

    constructor(private readonly opcionesService: OpcionesService) { }
    @Post()
    @ApiOperation({ summary: 'Crear nueva opción' })
    @ApiResponse({
        status: 201,
        description: 'La opción ha sido creada exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    create(@Body() createOpcionDto: CreateOpcionDto) {
        this.logger.log(`Creando nueva opción para la pregunta: ${createOpcionDto.preguntaId}`);
        return this.opcionesService.create(createOpcionDto);
    }
    @Get()
    @ApiOperation({ summary: 'Obtener listado de opciones' })
    @ApiQuery({
        name: 'preguntaId',
        required: false,
        description: 'Filtrar por ID de pregunta'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de opciones recuperada exitosamente'
    })
    findAll(@Query('preguntaId') preguntaId?: string) {
        if (preguntaId) {
            this.logger.log(`Obteniendo opciones para la pregunta con ID: ${preguntaId}`);
            return this.opcionesService.findAll(preguntaId);
        }

        this.logger.log('Obteniendo todas las opciones');
        return this.opcionesService.findAll();
    }
    @Get(':id')
    @ApiOperation({ summary: 'Obtener una opción por ID' })
    @ApiParam({ name: 'id', description: 'ID de la opción a buscar' })
    @ApiResponse({
        status: 200,
        description: 'Opción encontrada'
    })
    @ApiResponse({
        status: 404,
        description: 'Opción no encontrada'
    })
    findOne(@Param('id') id: string) {
        this.logger.log(`Buscando opción con ID: ${id}`);
        return this.opcionesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una opción existente' })
    @ApiParam({ name: 'id', description: 'ID de la opción a actualizar' })
    @ApiResponse({
        status: 200,
        description: 'Opción actualizada correctamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 404,
        description: 'Opción no encontrada'
    })
    update(@Param('id') id: string, @Body() updateOpcionDto: UpdateOpcionDto) {
        this.logger.log(`Actualizando opción con ID: ${id}`);
        return this.opcionesService.update(id, updateOpcionDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una opción' })
    @ApiParam({ name: 'id', description: 'ID de la opción a eliminar' })
    @ApiResponse({
        status: 200,
        description: 'Opción eliminada correctamente'
    })
    @ApiResponse({
        status: 404,
        description: 'Opción no encontrada'
    })
    remove(@Param('id') id: string) {
        this.logger.log(`Eliminando opción con ID: ${id}`);
        return this.opcionesService.remove(id);
    }
}
