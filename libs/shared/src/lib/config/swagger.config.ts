import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

// ✅ Constantes centralizadas
const DEFAULT_SWAGGER_VERSION = '1.0.0';
const DEFAULT_CONTACT = {
  name: 'BrainRush Team',
  url: 'https://brainrush.edu.co',
  email: 'support@brainrush.edu.co'
};
const DEFAULT_LICENSE = {
  name: 'MIT',
  url: 'https://opensource.org/licenses/MIT'
};

export interface SwaggerConfigOptions {
  serviceType: 'api-gateway' | 'internal-service';
  serviceName: string;
  serviceDescription: string;
  version?: string;
  tags?: SwaggerTag[];
  servers?: SwaggerServer[];
  customOptions?: Partial<SwaggerCustomOptions>;
}

export interface SwaggerTag {
  name: string;
  description: string;
}

export interface SwaggerServer {
  url: string;
  description: string;
}

export interface SwaggerCustomOptions {
  title?: string;
  contact?: {
    name: string;
    url: string;
    email: string;
  };
  license?: {
    name: string;
    url: string;
  };
  customCss?: string;
  enableInProduction?: boolean;
}

export function setupSwagger(app: INestApplication, options: SwaggerConfigOptions, logger?: any): void {
  try {
    // ✅ Validación básica de opciones
    if (!options?.serviceName || !options.serviceDescription) {
      throw new Error('Invalid Swagger configuration: serviceName and serviceDescription are required');
    }

    const {
      serviceType,
      serviceName,
      serviceDescription,
      version = DEFAULT_SWAGGER_VERSION,
      tags = [],
      servers = [],
      customOptions = {},

    } = options;

    // ✅ Seguridad mejorada
    const isProduction = process.env['NODE_ENV'] === 'production';
    const enableSwagger = process.env['ENABLE_SWAGGER'] === 'true';
    const isInternalService = serviceType === 'internal-service';

    if (!enableSwagger || (isProduction && isInternalService)) {
      logger?.log(serviceName, `📚 Swagger deshabilitado${isProduction ? ' en producción' : ''}`);
      return;
    }

    if (isProduction) {
      logger?.warn(serviceName, '⚠️ Swagger habilitado en PRODUCCIÓN - ¡Riesgo de seguridad!');
    }

    // ✅ Configuración del documento con constantes
    const config = new DocumentBuilder()
      .setTitle(customOptions.title || getDefaultTitle(serviceName, serviceType))
      .setDescription(getFormattedDescription(serviceDescription, serviceType))
      .setVersion(version)
      .setContact(
        customOptions.contact?.name || DEFAULT_CONTACT.name,
        customOptions.contact?.url || DEFAULT_CONTACT.url,
        customOptions.contact?.email || DEFAULT_CONTACT.email
      )
      .setLicense(
        customOptions.license?.name || DEFAULT_LICENSE.name,
        customOptions.license?.url || DEFAULT_LICENSE.url
      )
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'JWT token obtenido del auth-service',
        in: 'header',
      }, 'JWT-auth');

    // ✅ Añadir tags y servers de forma segura
    addTags(config, tags);
    addServers(config, serviceType, servers);

    const document = SwaggerModule.createDocument(app, config.build(), {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        `${controllerKey.replace('Controller', '')}_${methodKey}`,
    });



    const swaggerPath = getSwaggerPath(serviceType);
    const swaggerSetupOptions = getSwaggerSetupOptions(serviceName, serviceType, customOptions);

    SwaggerModule.setup(swaggerPath, app, document, swaggerSetupOptions);

    const port = process.env['PORT'] || '3000';
    logger?.log(serviceName, `📚 Swagger UI disponible en: http://localhost:${port}/${swaggerPath}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger?.error(options?.serviceName, `❌ Error configurando Swagger: ${errorMessage}`);
    // ✅ En desarrollo, re-lanzar el error para debugging
    if (process.env['NODE_ENV'] !== 'production') {
      throw new Error(`Swagger setup failed for ${options?.serviceName}: ${errorMessage}`);
    }
  }
}

// ✅ Funciones auxiliares mejoradas
function addTags(config: DocumentBuilder, tags: SwaggerTag[]): void {
  tags.forEach(tag => {
    if (tag.name && tag.description) {
      config.addTag(tag.name.trim(), tag.description.trim());
    }
  });
}

function addServers(config: DocumentBuilder, serviceType: string, customServers: SwaggerServer[]): void {
  const defaultServers = getDefaultServers(serviceType);
  const allServers = [...defaultServers, ...customServers];

  allServers.forEach(server => {
    if (server.url && server.description) {
      config.addServer(server.url.trim(), server.description.trim());
    }
  });
}

function getDefaultTitle(serviceName: string, serviceType: string): string {
  const formattedName = serviceName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return serviceType === 'api-gateway'
    ? `BrainRush API Gateway`
    : `BrainRush ${formattedName} API`;
}

function getFormattedDescription(description: string, serviceType: string): string {
  const prefix = serviceType === 'api-gateway'
    ? '🚀 **API Gateway Principal** del ecosistema BrainRush\n\n'
    : '🔧 **Servicio Interno** del ecosistema BrainRush\n\n';

  const footer = `
## 🔒 Autenticación
- Todos los endpoints requieren autenticación JWT
- Token obtenido a través del auth-service
- Header: \`Authorization: Bearer <token>\`

## 🌐 Arquitectura
- Parte del ecosistema de microservicios BrainRush
- Comunicación vía NATS para eventos
- Base de datos PostgreSQL dedicada

## 📊 Monitoreo
- Health checks disponibles en \`/health\`
- Métricas de performance incluidas
- Logging centralizado habilitado
  `;

  return prefix + description + footer;
}

function getDefaultServers(serviceType: string): SwaggerServer[] {
  if (serviceType === 'api-gateway') {
    return [
      { url: 'http://localhost:3335', description: 'Desarrollo Local' },
      { url: 'https://api-dev.brainrush.edu.co', description: 'Desarrollo' },
      { url: 'https://api.brainrush.edu.co', description: 'Producción' }
    ];
  }

  return [
    { url: 'http://localhost:' + (process.env['PORT'] || '3000'), description: 'Desarrollo Local' },
    { url: 'https://internal-dev.brainrush.edu.co', description: 'Desarrollo (Interno)' },
    { url: 'https://internal.brainrush.edu.co', description: 'Producción (Interno)' }
  ];
}

function getSwaggerPath(serviceType: string): string {
  return serviceType === 'api-gateway' ? 'api/docs' : 'docs';
}

function getSwaggerSetupOptions(serviceName: string, serviceType: string, customOptions: SwaggerCustomOptions) {
  // ✅ Formatear nombre usando función auxiliar
  const formattedServiceName = serviceName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const baseOptions = {
    customSiteTitle: `BrainRush ${formattedServiceName} API`,
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: false,
      showCommonExtensions: false,
      displayOperationId: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      docExpansion: 'list',
    },
  };

  const defaultCss = `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #1976d2; font-weight: bold; }
    .swagger-ui .info .description { line-height: 1.6; }
    .swagger-ui .scheme-container {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 10px;
      margin: 10px 0;
    }
    .swagger-ui .auth-wrapper { margin-top: 20px; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { font-size: 28px; }
    .swagger-ui .swagger-container { max-width: 1200px; margin: 0 auto; }
  `;

  return {
    ...baseOptions,
    customCss: customOptions.customCss || defaultCss,
  };
}

// ... resto de swaggerConfigs igual ...

// Configuraciones predefinidas para cada servicio
export const swaggerConfigs = {
  apiGateway: (customDescription?: string) => ({
    serviceType: 'api-gateway' as const,
    serviceName: 'api-gateway',
    serviceDescription: customDescription || `
## Características principales:
- 🔄 Enrutamiento inteligente a microservicios
- 🗜️ Compresión GZIP automática
- 🔒 Autenticación y autorización centralizada
- 📊 Rate limiting y throttling
- 📝 Logging y monitoreo unificado
- 🌐 CORS configurado para frontends

## Servicios conectados:
- **Auth Service**: Autenticación y autorización
- **User Service**: Gestión de usuarios y perfiles
- **Exams Service**: Exámenes y simulacros ICFES
- **Content Service**: Gestión de contenido
    `,
    tags: [
      { name: 'Gateway', description: 'Endpoints del API Gateway' },
      { name: 'Health', description: 'Health checks y monitoreo' },
      { name: 'Auth', description: 'Proxy a Auth Service' },
      { name: 'Users', description: 'Proxy a User Service' },
      { name: 'Exams', description: 'Proxy a Exams Service' },
      { name: 'Content', description: 'Proxy a Content Service' }
    ]
  }),

  authService: () => ({
    serviceType: 'internal-service' as const,
    serviceName: 'auth-service',
    serviceDescription: `
## Características principales:
- 🔐 Autenticación JWT robusta
- 🔑 Gestión de tokens y refresh tokens
- 👤 Registro e inicio de sesión
- 🔒 Autorización basada en roles
- 📧 Verificación de email
- 🔄 Integración con OAuth providers

## Endpoints principales:
- Registro y login de usuarios
- Gestión de tokens JWT
- Verificación de credenciales
- Administración de roles y permisos
    `,
    tags: [
      { name: 'Health', description: 'Endpoints de salud del servicio' },
      { name: 'Auth', description: 'Autenticación y autorización' },
      { name: 'Users', description: 'Gestión de usuarios' },
      { name: 'Tokens', description: 'Gestión de tokens JWT' }
    ]
  }),

  examsService: () => ({
    serviceType: 'internal-service' as const,
    serviceName: 'exams-service',
    serviceDescription: `
## Características principales:
- 📝 Gestión completa de exámenes (CRUD)
- ⏱️ Control de tiempo y intentos
- 📊 Estadísticas detalladas y analytics
- 🔒 Seguridad integrada con auth-service
- 🔄 Comunicación NATS para consistencia
- 📱 Compatible con dashboard responsive

## Tipos de exámenes soportados:
- **SIMULACRO**: Exámenes ICFES completos
- **PRACTICA**: Exámenes por área específica
- **QUIZ**: Cuestionarios cortos
- **DIAGNOSTICO**: Evaluaciones iniciales
- **SEGUIMIENTO**: Monitoreo de progreso
- **PERSONALIZADO**: Creados por profesores

## Roles de usuario:
- **ADMIN**: Acceso completo al sistema
- **TEACHER**: Crear y gestionar exámenes
- **STUDENT**: Realizar exámenes y ver resultados
    `,
    tags: [
      { name: 'Health', description: 'Endpoints de salud del servicio' },
      { name: 'Exams', description: 'Gestión de exámenes' },
      { name: 'Attempts', description: 'Intentos de exámenes' },
      { name: 'Statistics', description: 'Estadísticas y analytics' }
    ]
  }),

  contentService: () => ({
    serviceType: 'internal-service' as const,
    serviceName: 'content-service',
    serviceDescription: `
## Características principales:
- 📚 Gestión de contenido educativo
- 🎯 Áreas de conocimiento ICFES
- 📝 Textos y lecturas comprensivas
- ❓ Banco de preguntas categorizado
- 🎨 Opciones de respuesta múltiple
- 🔍 Sistema de búsqueda y filtros

## Gestión de contenido:
- **Áreas**: Matemáticas, Lenguaje, Ciencias, etc.
- **Textos**: Lecturas para comprensión
- **Preguntas**: Banco categorizado por dificultad
- **Opciones**: Respuestas múltiples con feedback
    `,
    tags: [
      { name: 'Health', description: 'Endpoints de salud del servicio' },
      { name: 'Areas', description: 'Gestión de áreas de conocimiento' },
      { name: 'Textos', description: 'Gestión de textos y lecturas' },
      { name: 'Preguntas', description: 'Banco de preguntas' },
      { name: 'Opciones', description: 'Opciones de respuesta' }
    ]
  })
};
