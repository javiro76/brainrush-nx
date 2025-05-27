import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateAreaDto, UpdateAreaDto } from './dto';
import { NatsService } from '../nats/nats.service';
// import { PrismaClient } from '@prisma/client';

@Injectable()
export class AreasService {
  private readonly logger = new Logger('AreasService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly natsService: NatsService,
  ) { } async create(createAreaDto: CreateAreaDto) {
    try {
      const area = await this.prisma.area.create({
        data: createAreaDto,
      });

      this.logger.log(`Área creada con ID: ${area.id}`);

      // Emitir evento de creación
      this.natsService.emitContentCreated({
        id: area.id,
        type: 'area',
        title: area.nombre,
      });

      return area;
    } catch (error) {
      this.logger.error(`Error al crear área: ${error.message}`);
      throw error;
    }
  } async findAll() {
    try {
      return await this.prisma.area.findMany();
    } catch (error) {
      this.logger.error(`Error al buscar áreas: ${error.message}`);
      throw error;
    }
  } async findOne(id: string) {
    try {
      const area = await this.prisma.area.findUnique({
        where: { id },
        include: {
          competencias: true,
        },
      });

      if (!area) {
        throw new NotFoundException(`Área con ID ${id} no encontrada`);
      }

      return area;
    } catch (error) {
      this.logger.error(`Error al buscar área con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateAreaDto: UpdateAreaDto) {
    try {
      // Verificar que el área existe
      await this.findOne(id);

      const updatedArea = await this.prisma.area.update({
        where: { id },
        data: updateAreaDto,
      });

      this.logger.log(`Área con ID ${id} actualizada`);

      // Emitir evento de actualización
      this.natsService.emitContentUpdated({
        id: updatedArea.id,
        type: 'area',
        title: updatedArea.nombre,
      });

      return updatedArea;
    } catch (error) {
      this.logger.error(`Error al actualizar área con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Verificar que el área existe
      await this.findOne(id);

      await this.prisma.area.delete({
        where: { id },
      });

      this.logger.log(`Área con ID ${id} eliminada`);
      return { id, message: `Área con ID ${id} eliminada correctamente` };
    } catch (error) {
      this.logger.error(`Error al eliminar área con ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
