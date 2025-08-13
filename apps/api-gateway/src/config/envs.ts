import * as dotenv from 'dotenv';
import * as joi from 'joi';

dotenv.config();

interface EnvVars {
  PORT: number;
  AUTH_SERVICE_HOST: string;
  AUTH_SERVICE_PORT: number;
  AUTH_SERVICE_URL: string;
  CONTENT_SERVICE_HOST: string;
  CONTENT_SERVICE_PORT: number;
  CONTENT_SERVICE_URL: string;
  NATS_SERVERS: string[];
  API_PREFIX?: string;
  ENABLE_SWAGGER: boolean;
}

const envsSchema = joi.object({
  PORT: joi.number().required(),
  AUTH_SERVICE_HOST: joi.string().hostname().required(),
  AUTH_SERVICE_PORT: joi.number().port().required(),
  AUTH_SERVICE_URL: joi.string().uri().default('http://localhost:3334'),
  CONTENT_SERVICE_HOST: joi.string().hostname().required(),
  CONTENT_SERVICE_PORT: joi.number().port().required(),
  CONTENT_SERVICE_URL: joi.string().uri().default('http://localhost:3336'),
  NATS_SERVERS: joi.array().items(joi.string().uri()).required(),
  API_PREFIX: joi.string().optional().default('/api'),
  ENABLE_SWAGGER: joi.boolean().required()
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
  AUTH_SERVICE_URL: value.AUTH_SERVICE_URL,
  CONTENT_SERVICE_HOST: value.CONTENT_SERVICE_HOST,
  CONTENT_SERVICE_PORT: value.CONTENT_SERVICE_PORT,
  CONTENT_SERVICE_URL: value.CONTENT_SERVICE_URL,
  NATS_SERVERS: value.NATS_SERVERS,
  API_PREFIX: value.API_PREFIX,
  ENABLE_SWAGGER: value.ENABLE_SWAGGER,
};
