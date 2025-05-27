import { Injectable } from '@nestjs/common';
import { LoggerService } from '@brainrush-nx/shared';

@Injectable()
export class NatsService {
  constructor(private readonly logger: LoggerService) {}

  // No constructor needed as it doesn't do anything
  /**
   * Registra creación de nuevo contenido (sin emisión de eventos por ahora)
   */
  emitContentCreated(contentData: {
    id: string;
    type: 'texto' | 'pregunta' | 'area' | 'competencia';
    title?: string;
  }) {
    try {      // Solo registramos el evento en el log por ahora
      this.logger.log('ContentEventService', `Contenido creado - ${contentData.type} con ID: ${contentData.id}`);
      // Implementación futura de emisión de eventos
    } catch (error) {
      this.logger.error('ContentEventService', `Error al registrar creación de contenido: ${error.message}`);
    }
  }
  /**
   * Registra actualización de contenido (sin emisión de eventos por ahora)
   */
  emitContentUpdated(contentData: {
    id: string;
    type: 'texto' | 'pregunta' | 'area' | 'competencia';
    title?: string;
  }) {
    try {      // Solo registramos el evento en el log por ahora
      this.logger.log('ContentEventService', `Contenido actualizado - ${contentData.type} con ID: ${contentData.id}`);
      // Implementación futura de emisión de eventos
    } catch (error) {
      this.logger.error('ContentEventService', `Error al registrar actualización de contenido: ${error.message}`);
    }
  }
}
