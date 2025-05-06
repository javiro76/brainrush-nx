import 'dotenv/config';
import * as Joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  NATS_SERVERS: string[];
  NATS_URL: string;
}

// Schema para validar variables de entorno
const envsSchema = Joi.object({
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  NATS_SERVERS: Joi.string().optional(),
  NATS_URL: Joi.string().optional(),
}).unknown(true); // Permitir variables adicionales

// Validar todas las variables de entorno
const { error, value } = envsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Procesar después de la validación
const envVars: EnvVars = {
  PORT: value.PORT,
  DATABASE_URL: value.DATABASE_URL,
  NATS_SERVERS: value.NATS_SERVERS?.split(',') || [],
  NATS_URL: value.NATS_URL || ''
};

export const envs = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  natsServers: envVars.NATS_SERVERS,
  natsUrl: envVars.NATS_URL,
};
