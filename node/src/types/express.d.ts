import { CurrentUserDto } from '../user/dto/current-user.dto';

declare module 'express' {
  interface Request {
    currentUser?: CurrentUserDto;
    requestId?: string;
  }
}
