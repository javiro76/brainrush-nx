import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload, UserRole } from '@brainrush-nx/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger('RolesGuard');

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles requeridos para la ruta desde los metadatos
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitimos el acceso
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as JwtPayload;

    // Si no hay usuario autenticado, negamos el acceso
    if (!user) {
      this.logger.warn('Intento de acceso a ruta protegida sin autenticación');
      throw new ForbiddenException('No tienes permiso para acceder a este recurso');
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRole = requiredRoles.some(role => user.role === role);

    if (!hasRole) {
      this.logger.warn(`Usuario ${user.email} (rol: ${user.role}) intentó acceder a ruta que requiere: ${requiredRoles.join(', ')}`);
      throw new ForbiddenException('No tienes permiso para acceder a este recurso');
    }

    return true;
  }
}
