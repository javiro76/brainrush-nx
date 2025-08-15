/**
 * User roles enum - manually defined to avoid Prisma client dependency
 * This should match the UserRole enum in auth-service/prisma/schema.prisma
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

/**
 * Enums object to match Prisma's $Enums structure
 * This provides the same interface as Prisma's generated client
 */
export const $Enums = {
  UserRole,
} as const;
