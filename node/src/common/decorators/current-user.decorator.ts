import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUserDto } from '../../user/dto/current-user.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserDto | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.currentUser;
  },
);
