import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreatePreguntaDto, UpdatePreguntaDto } from './dto';
import { NatsService } from '../nats/nats.service';

@Injectable()
export class PreguntasService {
  private readonly logger = new Logger('PreguntasService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly natsService: NatsService,
  ) { }

  async create(createPreguntaDto: CreatePreguntaDto) {
    try {
      // Extraer opciones para manejarlas por separado
      const { opciones, ...preguntaData } = createPreguntaDto;

      // Crear pregunta y opciones en una transacción
      const pregunta = await this.prisma.$transaction(async (tx) => {
        const nuevaPregunta = await tx.pregunta.create({
          data: {
            ...preguntaData,
            fechaCreacion: preguntaData.fechaCreacion ? new Date(preguntaData.fechaCreacion) : new Date(),
            activo: preguntaData.activo !== undefined ? preguntaData.activo : true,
          },
        });

        // Si hay opciones, crearlas
        if (opciones && opciones.length > 0) {
          await Promise.all(
            opciones.map((opcion, index) =>
              tx.opcion.create({
                data: {
                  preguntaId: nuevaPregunta.id,
                  textoOpcion: opcion.textoOpcion,
                  esCorrecta: opcion.esCorrecta || false,
                  retroalimentacion: opcion.retroalimentacion,
                  orden: index + 1,
                },
              }),
            ),
          );
        }

        return nuevaPregunta;
      });

      this.logger.log(`Pregunta creada con ID: ${pregunta.id}`);

      // Registrar evento
      this.natsService.emitContentCreated({
        id: pregunta.id,
        type: 'pregunta',
        title: pregunta.enunciado.substring(0, 30) + '...',
      });

      return pregunta;
    } catch (error) {
      this.logger.error(`Error al crear pregunta: ${error.message}`);
      throw error;
    }
  } async findAll(textoId?: string, areaId?: string) {
    try {
      const where: { textoId?: string; areaId?: string } = {};

      if (textoId) {
        where.textoId = textoId;
      }

      if (areaId) {
        where.areaId = areaId;
      }

      return await this.prisma.pregunta.findMany({
        where,
        include: {
          opciones: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error al buscar preguntas: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const pregunta = await this.prisma.pregunta.findUnique({
        where: { id },
        include: {
          opciones: true,
          area: true,
          texto: true,
          afirmacion: true,
        },
      });

      if (!pregunta) {
        throw new NotFoundException(`Pregunta con ID ${id} no encontrada`);
      }

      return pregunta;
    } catch (error) {
      this.logger.error(`Error al buscar pregunta con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updatePreguntaDto: UpdatePreguntaDto) {
    try {
      // Verificar que la pregunta existe
      await this.findOne(id);

      // Extraer opciones para manejarlas por separado
      const { opciones, ...preguntaData } = updatePreguntaDto;

      // Actualizar en una transacción
      await this.prisma.$transaction(async (tx) => {
        // Actualizar la pregunta
        await tx.pregunta.update({
          where: { id },
          data: {
            ...preguntaData,
            fechaCreacion: preguntaData.fechaCreacion ? new Date(preguntaData.fechaCreacion) : undefined,
          },
        });

        // Si hay opciones, actualizar las relaciones
        if (opciones) {
          // Eliminar opciones existentes
          await tx.opcion.deleteMany({
            where: { preguntaId: id },
          });

          // Crear nuevas opciones
          if (opciones.length > 0) {
            await Promise.all(
              opciones.map((opcion, index) =>
                tx.opcion.create({
                  data: {
                    preguntaId: id,
                    textoOpcion: opcion.textoOpcion,
                    esCorrecta: opcion.esCorrecta || false,
                    retroalimentacion: opcion.retroalimentacion,
                    orden: index + 1,
                  },
                }),
              ),
            );
          }
        }
      });

      // Obtener la pregunta actualizada
      const updatedPregunta = await this.findOne(id);

      this.logger.log(`Pregunta con ID ${id} actualizada`);

      // Registrar evento
      this.natsService.emitContentUpdated({
        id: updatedPregunta.id,
        type: 'pregunta',
        title: updatedPregunta.enunciado.substring(0, 30) + '...',
      });

      return updatedPregunta;
    } catch (error) {
      this.logger.error(`Error al actualizar pregunta con ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Verificar que la pregunta existe
      await this.findOne(id);

      // Eliminar la pregunta y sus opciones en una transacción
      await this.prisma.$transaction(async (tx) => {
        // Eliminar opciones
        await tx.opcion.deleteMany({
          where: { preguntaId: id },
        });

        // Eliminar la pregunta
        await tx.pregunta.delete({
          where: { id },
        });
      });

      this.logger.log(`Pregunta con ID ${id} eliminada`);
      return { id, message: `Pregunta con ID ${id} eliminada correctamente` };
    } catch (error) {
      this.logger.error(`Error al eliminar pregunta con ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
