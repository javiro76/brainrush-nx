import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ContentService } from '../content.service';
import { JwtAuthGuard } from '../../auth/guards';
import { CreateAreaDto, UpdateAreaDto } from '../dto';

@Controller('areas')
export class AreasController {
    constructor(private readonly contentService: ContentService) { }

    @Get()
    async findAll() {
        return this.contentService.getAllAreas();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.contentService.getAreaById(id);
    }
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createAreaDto: CreateAreaDto) {
        return this.contentService.createArea(createAreaDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
        return this.contentService.updateArea(id, updateAreaDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string) {
        return this.contentService.deleteArea(id);
    }
}
