import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NatsService {  private readonly logger = new Logger('ContentEventService');

  // No constructor needed as it doesn't do anything
  /**
   * Registra creación de nuevo contenido (sin emisión de eventos por ahora)
   */
  emitContentCreated(contentData: {
    id: string;
    type: 'texto' | 'pregunta' | 'area' | 'competencia';
    title?: string;
  }) {
    try {
      // Solo registramos el evento en el log por ahora
      this.logger.log(`Contenido creado - ${contentData.type} con ID: ${contentData.id}`);
      // Implementación futura de emisión de eventos
    } catch (error) {
      this.logger.error(`Error al registrar creación de contenido: ${error.message}`);
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
    try {
      // Solo registramos el evento en el log por ahora
      this.logger.log(`Contenido actualizado - ${contentData.type} con ID: ${contentData.id}`);
      // Implementación futura de emisión de eventos
    } catch (error) {
      this.logger.error(`Error al registrar actualización de contenido: ${error.message}`);
    }
  }
}
