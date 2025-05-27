import * as dotenv from 'dotenv';
import * as joi from 'joi';

dotenv.config();

interface EnvVars {
  PORT: number;
  AUTH_SERVICE_HOST: string;
  AUTH_SERVICE_PORT: number;
  NATS_SERVERS: string[];
  API_PREFIX?: string;
}

const envsSchema = joi.object({
  PORT: joi.number().required(),
  AUTH_SERVICE_HOST: joi.string().hostname().required(),
  AUTH_SERVICE_PORT: joi.number().port().required(),
  NATS_SERVERS: joi.array().items(joi.string().uri()).required(),
  API_PREFIX: joi.string().optional().default('/api')
}).unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(',') || ['nats://localhost:4222']
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs: EnvVars = {
  PORT: value.PORT,
   AUTH_SERVICE_HOST: value.AUTH_SERVICE_HOST,
  AUTH_SERVICE_PORT: value.AUTH_SERVICE_PORT,
  NATS_SERVERS: value.NATS_SERVERS,
  API_PREFIX: value.API_PREFIX
};
