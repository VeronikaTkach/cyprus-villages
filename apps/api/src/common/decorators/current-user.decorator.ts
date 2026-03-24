import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { IJwtPayload } from '../../modules/auth/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IJwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request & { user: IJwtPayload }>();
    return request.user;
  },
);
