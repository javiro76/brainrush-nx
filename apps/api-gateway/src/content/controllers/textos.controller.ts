import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ContentService } from '../content.service';
import { JwtAuthGuard } from '../../auth/guards';
import { CreateTextoDto, UpdateTextoDto } from '../dto';

@Controller('textos')
export class TextosController {
    constructor(private readonly contentService: ContentService) { }

    @Get()
    async findAll() {
        return this.contentService.getAllTextos();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.contentService.getTextoById(id);
    }
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createTextoDto: CreateTextoDto) {
        return this.contentService.createTexto(createTextoDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateTextoDto: UpdateTextoDto) {
        return this.contentService.updateTexto(id, updateTextoDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string) {
        return this.contentService.deleteTexto(id);
    }
}
