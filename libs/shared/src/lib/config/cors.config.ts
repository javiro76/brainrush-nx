import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export interface CorsConfigOptions {
  serviceType: 'api-gateway' | 'internal-service';
  allowedOrigins?: string[];
  developmentMode?: boolean;
}

export function getCorsConfig(options: CorsConfigOptions): CorsOptions {
  const { serviceType, allowedOrigins = [], developmentMode = process.env['NODE_ENV'] !== 'production' } = options;

  if (serviceType === 'api-gateway') {
    return getApiGatewayCorsConfig(allowedOrigins, developmentMode);
  } else {
    return getInternalServiceCorsConfig(developmentMode);
  }
}

function getApiGatewayCorsConfig(allowedOrigins: string[], developmentMode: boolean): CorsOptions {
  return {
    origin: developmentMode ? true : [
      // Dominios de producción
      'https://brainrush.com',
      'https://api.brainrush.com',
      'https://www.brainrush.com',
      ...allowedOrigins // Orígenes adicionales si se proporcionan
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key'
    ],
    credentials: true,
    optionsSuccessStatus: 200, // Para navegadores legacy
    maxAge: 86400, // Cache preflight por 24 horas
  };
}

function getInternalServiceCorsConfig(developmentMode: boolean): CorsOptions {
  const apiGatewayUrl = process.env['API_GATEWAY_URL'] || 'http://localhost:3335';

  return {
    origin: developmentMode ? [
      // Desarrollo: API Gateway y localhost para testing
      'http://localhost:3335',
      'http://localhost:3000',
      'http://localhost:4200', // Para Angular/React dev server
      apiGatewayUrl
    ] : [
      // Producción: Solo API Gateway
      apiGatewayUrl,
      // Agregar otros servicios internos si es necesario
      process.env['INTERNAL_SERVICES_URLS']?.split(',') || []
    ].flat(),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Service-Token' // Para comunicación entre servicios
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  };
}

// Exportar configuraciones específicas para fácil uso
export const corsConfigs = {
  apiGateway: (allowedOrigins?: string[]) => getCorsConfig({
    serviceType: 'api-gateway',
    allowedOrigins
  }),
  internalService: () => getCorsConfig({
    serviceType: 'internal-service'
  })
};
