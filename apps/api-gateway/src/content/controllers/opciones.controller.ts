import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ContentService } from '../content.service';
import { JwtAuthGuard } from '../../auth/guards';
import { CreateOpcionDto, UpdateOpcionDto } from '../dto';

@Controller('opciones')
export class OpcionesController {
    constructor(private readonly contentService: ContentService) { }

    @Get()
    async findAll(@Query('preguntaId') preguntaId?: string) {
        return this.contentService.getAllOpciones(preguntaId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.contentService.getOpcionById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createOpcionDto: CreateOpcionDto) {
        return this.contentService.createOpcion(createOpcionDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateOpcionDto: UpdateOpcionDto) {
        return this.contentService.updateOpcion(id, updateOpcionDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string) {
        return this.contentService.deleteOpcion(id);
    }
}
