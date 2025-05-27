import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateTextoDto, UpdateTextoDto } from './dto';
import { NatsService } from '../nats/nats.service';
import { LoggerService } from '@brainrush-nx/shared';

@Injectable()
export class TextosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly natsService: NatsService,
    private readonly logger: LoggerService,
  ) { }

  async create(createTextoDto: CreateTextoDto) {
    try {
      // Extraer los ids de taxonomía Bloom para crear las relaciones
      const { taxonomiaBloomIds, ...textoData } = createTextoDto;

      // Crear texto y sus relaciones en una transacción
      const texto = await this.prisma.$transaction(async (tx) => {
        // Crear el texto base
        const nuevoTexto = await tx.texto.create({
          data: {
            ...textoData,
            fechaCreacion: textoData.fechaCreacion ? new Date(textoData.fechaCreacion) : new Date(),
            palabrasClave: textoData.palabrasClave || [],
          },
        });

        // Si hay IDs de taxonomía Bloom, crear las relaciones
        if (taxonomiaBloomIds && taxonomiaBloomIds.length > 0) {
          await Promise.all(
            taxonomiaBloomIds.map((taxonomiaBloomId) =>
              tx.textoTaxonomiaBloom.create({
                data: {
                  textoId: nuevoTexto.id,
                  taxonomiaBloomId,
                },
              }),
            ),
          );
        }

        return nuevoTexto;
      });

      this.logger.log('TextosService', `Texto creado con ID: ${texto.id}`);

      // Emitir evento de creación
      this.natsService.emitContentCreated({
        id: texto.id,
        type: 'texto',
        title: texto.fuente || texto.id,
      });

      return texto;
    } catch (error) {
      this.logger.error('TextosService', `Error al crear texto: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.texto.findMany({
        include: {
          taxonomiaBloom: {
            include: {
              taxonomiaBloom: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('TextosService', `Error al buscar textos: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const texto = await this.prisma.texto.findUnique({
        where: { id },
        include: {
          preguntas: true,
          taxonomiaBloom: {
            include: {
              taxonomiaBloom: true,
            },
          },
        },
      });

      if (!texto) {
        throw new NotFoundException(`Texto con ID ${id} no encontrado`);
      }

      return texto;
    } catch (error) {
      this.logger.error('TextosService', `Error al buscar texto con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateTextoDto: UpdateTextoDto) {
    try {
      // Verificar que el texto existe
      await this.findOne(id);

      // Extraer los ids de taxonomía Bloom para manejarlos por separado
      const { taxonomiaBloomIds, ...textoData } = updateTextoDto;

      // Actualizar en una transacción
      await this.prisma.$transaction(async (tx) => {
        // Actualizar el texto
        await tx.texto.update({
          where: { id },
          data: {
            ...textoData,
            fechaCreacion: textoData.fechaCreacion ? new Date(textoData.fechaCreacion) : undefined,
          },
        });

        // Si hay IDs de taxonomía Bloom, actualizar las relaciones
        if (taxonomiaBloomIds) {
          // Eliminar relaciones existentes
          await tx.textoTaxonomiaBloom.deleteMany({
            where: { textoId: id },
          });

          // Crear nuevas relaciones
          if (taxonomiaBloomIds.length > 0) {
            await Promise.all(
              taxonomiaBloomIds.map((taxonomiaBloomId) =>
                tx.textoTaxonomiaBloom.create({
                  data: {
                    textoId: id,
                    taxonomiaBloomId,
                  },
                }),
              ),
            );
          }
        }
      });

      // Obtener el texto actualizado
      const updatedTexto = await this.findOne(id);

      this.logger.log('TextosService', `Texto con ID ${id} actualizado`);

      // Emitir evento de actualización
      this.natsService.emitContentUpdated({
        id: updatedTexto.id,
        type: 'texto',
        title: updatedTexto.fuente || updatedTexto.id,
      });

      return updatedTexto;
    } catch (error) {
      this.logger.error('TextosService', `Error al actualizar texto con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Verificar que el texto existe
      await this.findOne(id);

      // Eliminar el texto y sus relaciones en una transacción
      await this.prisma.$transaction(async (tx) => {
        // Eliminar relaciones con taxonomía Bloom
        await tx.textoTaxonomiaBloom.deleteMany({
          where: { textoId: id },
        });

        // Eliminar el texto
        await tx.texto.delete({
          where: { id },
        });
      });

      this.logger.log('TextosService', `Texto con ID ${id} eliminado`);
      return { id, message: `Texto con ID ${id} eliminado correctamente` };
    } catch (error) {
      this.logger.error('TextosService', `Error al eliminar texto con ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
