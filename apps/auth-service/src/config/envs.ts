import 'dotenv/config';
import * as Joi from 'joi';

interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NATS_SERVERS: string[];
}

const envsSchema = Joi.object({
  PORT: Joi.number().default(3334),
  DATABASE_URL: Joi.string().required()
    .description('URL de conexión a la base de datos de autenticación'),
  JWT_SECRET: Joi.string().required()
    .description('Secreto para firmar los tokens JWT'),
  JWT_EXPIRES_IN: Joi.string().default('30m')
    .description('Tiempo de expiración de los tokens (ej: 30m, 1h, 7d)'),
  NATS_SERVERS: Joi.array()
    .items(Joi.string().uri({ scheme: ['nats'] }))
    .default(['nats://localhost:4222'])
}).unknown(true); // Permite otras variables no validadas

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) {
  throw new Error(`[Auth-Service Config] Validation error: ${error.message}`);
}

export const envs = {
  port: value.PORT,
  databaseUrl: value.DATABASE_URL,
  jwtSecret: value.JWT_SECRET,
  jwtExpiresIn: value.JWT_EXPIRES_IN,
  natsServers: value.NATS_SERVERS
};
