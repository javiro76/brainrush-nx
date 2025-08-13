import { INestApplication, ValidationPipe,VersioningType } from '@nestjs/common';
import { MicroserviceExceptionFilter, HttpExceptionFilter } from '../filters';



export interface AppConfigOptions {
  serviceName: string;
  apiPrefix?: string;
  excludeFromPrefix?: string[];
  enableVersioning?: boolean;
  defaultVersion?: string;
  enableDetailedErrors?: boolean;
}

/**
 * Configura la aplicación NestJS con opciones globales.
 *
 * @param app - Instancia de la aplicación NestJS.
 * @param options - Opciones de configuración de la aplicación.
 */

export const configureApp = (
  app: INestApplication,
  options: AppConfigOptions
): void => {
  const {
    serviceName,
    apiPrefix = '/api',
    excludeFromPrefix = ['/health'],
    enableVersioning = false,
    defaultVersion = '1',
    enableDetailedErrors = process.env['NODE_ENV'] !== 'production'
  } = options;

  // ====================================
  // PREFIJO GLOBAL DE API
  // ====================================
  app.setGlobalPrefix(apiPrefix, {
    exclude: excludeFromPrefix,
  });

  // ====================================
  // VERSIONADO (OPCIONAL)
  // ====================================
  if (enableVersioning) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion,
    });
  }

  // ====================================
  // PIPES GLOBALES (VALIDACIÓN)
  // ====================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Solo propiedades definidas en DTO
      forbidNonWhitelisted: true,   // Rechazar propiedades no definidas
      transform: true,              // Auto-transformar tipos
      transformOptions: {
        enableImplicitConversion: true, // Conversión automática de tipos
      },
      disableErrorMessages: process.env['NODE_ENV'] === 'production', // Sin detalles en prod
    }),
  );

  // ====================================
  // FILTROS GLOBALES (MANEJO DE ERRORES)
  // ====================================
  if (enableDetailedErrors) {
    app.useGlobalFilters(new HttpExceptionFilter());
  } else {
    app.useGlobalFilters(new MicroserviceExceptionFilter());
  }

  console.log(`✅ ${serviceName}: Configuración global aplicada`);
  console.log(`   📍 API Prefix: /${apiPrefix}`);
  console.log(`   🏥 Health Check: /health (excluded from prefix)`);
  if (enableVersioning) {
    console.log(`   📦 Versioning: enabled (default v${defaultVersion})`);
  }
};
