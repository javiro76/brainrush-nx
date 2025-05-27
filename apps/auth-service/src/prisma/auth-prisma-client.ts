/**
 * Cliente Prisma específico para auth-service
 * Incluye modelos User y RefreshToken
 */

// Importamos desde el alias configurado en tsconfig.base.json
import { PrismaClient } from '@prisma/auth-client';

// Define el tipo con los modelos específicos que necesitamos
export class AuthPrismaClient extends PrismaClient {
  constructor() {
    super();
  }
}

// Re-exportamos los tipos desde el cliente específico de auth
export * from '@prisma/auth-client';
