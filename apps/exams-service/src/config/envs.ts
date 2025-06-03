import * as dotenv from 'dotenv';
import * as joi from 'joi';

dotenv.config();

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NATS_SERVERS: string;
  CONTENT_SERVICE_HOST: string;
  CONTENT_SERVICE_PORT: number;
  CONTENT_SERVICE_URL: string;
  AUTH_SERVICE_HOST: string;
  AUTH_SERVICE_PORT: number;
  AUTH_SERVICE_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;
  REDIS_URL: string;
  NODE_ENV: string;
  CORS_ORIGINS: string;
}

const envsSchema = joi.object({
  PORT: joi.number().default(3337),
  DATABASE_URL: joi.string().required()
    .description('URL de conexión a la base de datos de exámenes'),
  JWT_SECRET: joi.string().required()
    .description('Secreto para validar los tokens JWT'),
  JWT_EXPIRES_IN: joi.string().default('30m')
    .description('Tiempo de expiración de los tokens (ej: 30m, 1h, 7d)'),  NATS_SERVERS: joi.string()
    .default('nats://localhost:4222')
    .description('Servidor NATS para comunicación entre servicios'),
  CONTENT_SERVICE_HOST: joi.string().default('localhost')
    .description('Host del servicio de contenido'),
  CONTENT_SERVICE_PORT: joi.number().default(3336)
    .description('Puerto del servicio de contenido'),
  CONTENT_SERVICE_URL: joi.string().default('http://localhost:3336')
    .description('URL completa del servicio de contenido'),
  AUTH_SERVICE_HOST: joi.string().default('localhost')
    .description('Host del servicio de autenticación'),
  AUTH_SERVICE_PORT: joi.number().default(3334)
    .description('Puerto del servicio de autenticación'),
  AUTH_SERVICE_URL: joi.string().default('http://localhost:3334')
    .description('URL completa del servicio de autenticación'),  REDIS_HOST: joi.string().default('localhost')
    .description('Host del servidor Redis'),
  REDIS_PORT: joi.number().default(6379)
    .description('Puerto del servidor Redis'),  REDIS_PASSWORD: joi.string().optional().allow('')
    .description('Password del servidor Redis (opcional)'),
  REDIS_DB: joi.number().default(0)
    .description('Base de datos Redis (0-15)'),
  REDIS_URL: joi.string().default('redis://localhost:6379')
    .description('URL completa del servidor Redis'),
  NODE_ENV: joi.string().default('development')
    .valid('development', 'production', 'test')
    .description('Entorno de ejecución'),
  CORS_ORIGINS: joi.string().default('http://localhost:3000,http://localhost:4200')
    .description('Orígenes permitidos para CORS'),
}).unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS || 'nats://localhost:4222'
});

if (error) {
  throw new Error(`[Exams-Service Config] Validation error: ${error.message}`);
}

export const envs: EnvVars = {
  PORT: value.PORT,
  DATABASE_URL: value.DATABASE_URL,
  JWT_SECRET: value.JWT_SECRET,
  JWT_EXPIRES_IN: value.JWT_EXPIRES_IN,
  NATS_SERVERS: value.NATS_SERVERS,
  CONTENT_SERVICE_HOST: value.CONTENT_SERVICE_HOST,
  CONTENT_SERVICE_PORT: value.CONTENT_SERVICE_PORT,
  CONTENT_SERVICE_URL: value.CONTENT_SERVICE_URL,
  AUTH_SERVICE_HOST: value.AUTH_SERVICE_HOST,
  AUTH_SERVICE_PORT: value.AUTH_SERVICE_PORT,
  AUTH_SERVICE_URL: value.AUTH_SERVICE_URL,
  REDIS_HOST: value.REDIS_HOST,
  REDIS_PORT: value.REDIS_PORT,
  REDIS_PASSWORD: value.REDIS_PASSWORD,
  REDIS_DB: value.REDIS_DB,
  REDIS_URL: value.REDIS_URL,
  NODE_ENV: value.NODE_ENV,
  CORS_ORIGINS: value.CORS_ORIGINS,
};
