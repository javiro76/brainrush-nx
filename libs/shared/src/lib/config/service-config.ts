import { AppConfigOptions } from './app-config';

// ====================================
// CONFIGURACIONES POR TIPO DE SERVICIO
// ====================================

export const API_GATEWAY_CONFIG: AppConfigOptions = {
  serviceName: 'API-Gateway',
  apiPrefix: 'api',
  excludeFromPrefix: ['/health', '/docs'],
  enableVersioning: true,
  defaultVersion: '1',
};

export const AUTH_SERVICE_CONFIG: AppConfigOptions = {
  serviceName: 'Auth-Service',
  apiPrefix: '',
  excludeFromPrefix: ['/health','/docs'],
  enableVersioning: false,
};

export const CONTENT_SERVICE_CONFIG: AppConfigOptions = {
  serviceName: 'Content-Service',
  apiPrefix: '',
  excludeFromPrefix: ['/health','/docs'],
  enableVersioning: false,
};

export const EXAMS_SERVICE_CONFIG: AppConfigOptions = {
  serviceName: 'Exams-Service',
  apiPrefix: '',
  excludeFromPrefix: ['/health','/docs'],
  enableVersioning: false,
};

// ====================================
// HELPER FUNCTIONS
//factory pattern para obtener la configuración del servicio
// ====================================

/**
 * Obtiene la configuración de un servicio específico.
 *
 * @param serviceName - Nombre del servicio para el cual se desea obtener la configuración.
 * @returns Configuración del servicio o una configuración por defecto si no se encuentra.
 */
export const getServiceConfig = (serviceName: string): AppConfigOptions => {
  const configs: Record<string, AppConfigOptions> = {
    'api-gateway': API_GATEWAY_CONFIG,
    'auth-service': AUTH_SERVICE_CONFIG,
    'content-service': CONTENT_SERVICE_CONFIG,
    'exams-service': EXAMS_SERVICE_CONFIG,
  };

  return configs[serviceName] || {
    serviceName: 'Unknown-Service',
    apiPrefix: 'api',
    excludeFromPrefix: ['/health'],
  };
};
