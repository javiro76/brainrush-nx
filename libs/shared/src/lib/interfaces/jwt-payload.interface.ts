import { UserRole } from '@brainrush-nx/shared';

export interface JwtPayload {
  sub: string;         // ID del usuario
  email: string;       // Email del usuario
  name: string;        // Nombre del usuario
  role: UserRole;      // Rol del usuario
  iat?: number;        // Issued at (automático)
  exp?: number;        // Expiration time (automático)
}
