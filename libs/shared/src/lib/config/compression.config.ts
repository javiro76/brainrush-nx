import * as compression from 'compression';
import { RequestHandler } from 'express';
import { constants } from 'zlib';

export interface CompressionConfigOptions {
  serviceType: 'api-gateway' | 'internal-service' | 'static-service';
  customExclusions?: string[];
  compressionLevel?: number;
  threshold?: number;
}

export function getCompressionMiddleware(options: CompressionConfigOptions): RequestHandler {
  const {
    serviceType,
    customExclusions = [],
    compressionLevel = 6,
    threshold = 1024
  } = options;

  return compression({
    // Filtro inteligente para decidir qué comprimir
    filter: (req, res) => {
      // No comprimir si el cliente no lo soporta
      if (req.headers['x-no-compression']) {
        return false;
      }

      // No comprimir archivos ya comprimidos
      const contentType = res.getHeader('content-type') as string;
      if (contentType) {
        // Archivos multimedia (ya comprimidos)
        if (contentType.includes('image/') ||
            contentType.includes('video/') ||
            contentType.includes('audio/') ||
            contentType.includes('application/zip') ||
            contentType.includes('application/gzip') ||
            contentType.includes('application/pdf') ||
            contentType.includes('application/octet-stream')) {
          return false;
        }
      }

      // Exclusiones por tipo de servicio
      const defaultExclusions = getDefaultExclusions(serviceType);
      const allExclusions = [...defaultExclusions, ...customExclusions];

      // Excluir rutas específicas
      if (allExclusions.some(exclusion => req.path.includes(exclusion))) {
        return false;
      }

      // Usar el filtro por defecto de compression para el resto
      return compression.filter(req, res);
    },

    // Configuración de performance
    threshold,          // Solo comprimir si > threshold
    level: compressionLevel, // Balance entre velocidad y compresión (1-9)
    chunkSize: 16384,   // 16KB chunks para mejor streaming
    windowBits: 15,     // Ventana de compresión (8-15)
    memLevel: 8,        // Memoria para compresión (1-9)
    strategy: constants.Z_DEFAULT_STRATEGY
  });
}

function getDefaultExclusions(serviceType: CompressionConfigOptions['serviceType']): string[] {
  switch (serviceType) {
    case 'api-gateway':
      return [
        '/static/',
        '/assets/',
        '/uploads/',
        '/media/',
        '/files/',
        '/images/',
        '/favicon.ico'
      ];

    case 'internal-service':
      return [
        '/health',
        '/metrics',
        '/static/',
        '/uploads/'
      ];

    case 'static-service':
      return [
        '/images/',
        '/videos/',
        '/audio/',
        '/documents/',
        '/downloads/'
      ];

    default:
      return ['/static/', '/uploads/'];
  }
}

// Configuraciones predefinidas para fácil uso
export const compressionConfigs = {
  // Para API Gateway (servicio público)
  apiGateway: (customOptions?: Partial<CompressionConfigOptions>) =>
    getCompressionMiddleware({
      serviceType: 'api-gateway',
      compressionLevel: 6,
      threshold: 1024,
      ...customOptions
    }),

  // Para servicios internos (opcional, solo para endpoints grandes)
  internalService: (customOptions?: Partial<CompressionConfigOptions>) =>
    getCompressionMiddleware({
      serviceType: 'internal-service',
      compressionLevel: 4, // Menos agresivo para servicios internos
      threshold: 5120,     // Solo para responses > 5KB
      ...customOptions
    }),

  // Para servicios que sirven archivos estáticos
  staticService: (customOptions?: Partial<CompressionConfigOptions>) =>
    getCompressionMiddleware({
      serviceType: 'static-service',
      compressionLevel: 8, // Más agresivo para archivos estáticos
      threshold: 2048,
      ...customOptions
    }),
};

// Función de logging centralizada
export function logCompressionConfig(
  serviceName: string,
  compressionLevel: number,
  threshold: number,
  logger: any
): void {
  logger.log(serviceName, '🗜️ Compresión GZIP habilitada');
  logger.log(serviceName, `📊 Level: ${compressionLevel} | Threshold: ${threshold}B | ChunkSize: 16KB`);
}
