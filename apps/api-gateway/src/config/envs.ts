
import 'dotenv/config';

import * as joi from 'joi';


interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  API_PREFIX?: string; // Ej: '/api/v1'
}


const envsSchema = joi.object({
  PORT: joi.number().required(),
  NATS_SERVERS: joi.array().items(joi.string().uri()).optional().default(['nats://localhost:4222']),
  API_PREFIX: joi.string().optional().default('/api')
}).unknown(true); // Permitir propiedades adicionales

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  apiPrefix: envVars.API_PREFIX // Para globalPrefix en Nest
};
