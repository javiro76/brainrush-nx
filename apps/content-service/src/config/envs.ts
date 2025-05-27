import * as dotenv from 'dotenv';
import * as joi from 'joi';

dotenv.config();

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

const envsSchema = joi.object({
  PORT: joi.number().required(),
  DATABASE_URL: joi.string().required(),
  JWT_SECRET: joi.string().required(),
  JWT_EXPIRES_IN: joi.string().required()
}).unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs: EnvVars = {
  PORT: value.PORT,
  DATABASE_URL: value.DATABASE_URL,
  JWT_SECRET: value.JWT_SECRET,
   JWT_EXPIRES_IN: value.JWT_EXPIRES_IN
};
