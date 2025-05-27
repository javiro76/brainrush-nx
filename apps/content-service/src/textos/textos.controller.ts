import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LoggerService } from '@brainrush-nx/shared';
import { TextosService } from './textos.service';
import { CreateTextoDto, UpdateTextoDto } from './dto';

@Controller('textos')
export class TextosController {
    constructor(
        private readonly textosService: TextosService,
        private readonly logger: LoggerService
    ) { }    @Post()
    create(@Body() createTextoDto: CreateTextoDto) {
        this.logger.log('TextosController', `Creando nuevo texto con ID: ${createTextoDto.id}`);
        return this.textosService.create(createTextoDto);
    }

    @Get()
    findAll() {
        this.logger.log('TextosController', 'Obteniendo todos los textos');
        return this.textosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        this.logger.log('TextosController', `Buscando texto con ID: ${id}`);
        return this.textosService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTextoDto: UpdateTextoDto) {
        this.logger.log('TextosController', `Actualizando texto con ID: ${id}`);
        return this.textosService.update(id, updateTextoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        this.logger.log('TextosController', `Eliminando texto con ID: ${id}`);
        return this.textosService.remove(id);
    }
}
