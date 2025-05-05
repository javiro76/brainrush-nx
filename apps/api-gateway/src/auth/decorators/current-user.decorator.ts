import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayload } from '@brainrush-nx/shared';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
