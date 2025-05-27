import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateOpcionDto, UpdateOpcionDto } from './dto';

@Injectable()
export class OpcionesService {
  private readonly logger = new Logger('OpcionesService');

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createOpcionDto: CreateOpcionDto) {
    try {
      const opcion = await this.prisma.opcion.create({
        data: {
          preguntaId: createOpcionDto.preguntaId,
          textoOpcion: createOpcionDto.textoOpcion,
          esCorrecta: createOpcionDto.esCorrecta || false,
          retroalimentacion: createOpcionDto.retroalimentacion,
          orden: createOpcionDto.orden || 0,
        },
      });

      this.logger.log(`Opción creada con ID: ${opcion.id}`);

      return opcion;
    } catch (error) {
      this.logger.error(`Error al crear opción: ${error.message}`);
      throw error;
    }
  }

  async findAll(preguntaId?: string) {
    try {
      const where = preguntaId ? { preguntaId } : {};

      return await this.prisma.opcion.findMany({
        where,
        orderBy: {
          orden: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Error al buscar opciones: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const opcion = await this.prisma.opcion.findUnique({
        where: { id },
        include: {
          pregunta: true,
        },
      });

      if (!opcion) {
        throw new NotFoundException(`Opción con ID ${id} no encontrada`);
      }

      return opcion;
    } catch (error) {
      this.logger.error(`Error al buscar opción con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateOpcionDto: UpdateOpcionDto) {
    try {
      // Verificar que la opción existe
      await this.findOne(id);

      const updatedOpcion = await this.prisma.opcion.update({
        where: { id },
        data: {
          textoOpcion: updateOpcionDto.textoOpcion,
          esCorrecta: updateOpcionDto.esCorrecta,
          retroalimentacion: updateOpcionDto.retroalimentacion,
          orden: updateOpcionDto.orden,
        },
      });

      this.logger.log(`Opción con ID ${id} actualizada`);

      return updatedOpcion;
    } catch (error) {
      this.logger.error(`Error al actualizar opción con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Verificar que la opción existe
      await this.findOne(id);

      await this.prisma.opcion.delete({
        where: { id },
      });

      this.logger.log(`Opción con ID ${id} eliminada`);
      return { id, message: `Opción con ID ${id} eliminada correctamente` };
    } catch (error) {
      this.logger.error(`Error al eliminar opción con ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
