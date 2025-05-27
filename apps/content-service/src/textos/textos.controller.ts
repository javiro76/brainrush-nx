import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { TextosService } from './textos.service';
import { CreateTextoDto, UpdateTextoDto } from './dto';

@Controller('textos')
export class TextosController {
    private readonly logger = new Logger('TextosController');

    constructor(private readonly textosService: TextosService) { }

    @Post()
    create(@Body() createTextoDto: CreateTextoDto) {
        this.logger.log(`Creando nuevo texto con ID: ${createTextoDto.id}`);
        return this.textosService.create(createTextoDto);
    }

    @Get()
    findAll() {
        this.logger.log('Obteniendo todos los textos');
        return this.textosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        this.logger.log(`Buscando texto con ID: ${id}`);
        return this.textosService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTextoDto: UpdateTextoDto) {
        this.logger.log(`Actualizando texto con ID: ${id}`);
        return this.textosService.update(id, updateTextoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        this.logger.log(`Eliminando texto con ID: ${id}`);
        return this.textosService.remove(id);
    }
}
