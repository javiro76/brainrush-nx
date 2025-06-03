import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Observable, catchError, map, of } from 'rxjs';
import { NatsService } from '../nats/nats.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly natsService: NatsService) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('No token provided in request');
      throw new UnauthorizedException('Token not provided');
    }

    return this.natsService.validateToken(token).pipe(
      map((response) => {
        if (!response || !response.valid) {
          this.logger.warn('Invalid token provided');
          throw new UnauthorizedException('Invalid token');
        }

        // Agregar información del usuario al request
        request.user = response.user;
        request.token = token;

        this.logger.debug(`User authenticated: ${response.user.id}`);
        return true;
      }),
      catchError((error) => {
        this.logger.error('Token validation error:', error);
        throw new UnauthorizedException('Token validation failed');
      }),
    );
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
