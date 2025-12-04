import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import { UserService } from '../user/user.service';
import { TokenService } from './token.service';

/**
 * AuthGuard checks whether the incoming request has a valid authentication token.
 *
 * It reads the 'auth_token' from cookies, verifies it using the TokenService,
 * fetches the corresponding user from the database, and attaches the user to the request object.
 * If any step fails, it throws an UnauthorizedException.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  /**
   * Determines whether a request can proceed based on authentication.
   *
   * @param context - The execution context of the request.
   * @returns A boolean indicating whether the request is authorized.
   * @throws UnauthorizedException if the token is missing, invalid, expired, or the user does not exist.
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const cookies = request.cookies as Record<string, string | undefined>;
    const authToken: string | undefined = cookies.auth_token;

    if (!authToken) {
      throw new UnauthorizedException('Invalid Auth Token');
    }

    let userId = 0;

    try {
      const authPayload = await this.tokenService.verifyAuthToken(authToken);
      userId = authPayload.userId;
    } catch {
      throw new UnauthorizedException('Invalid or Expired Token');
    }

    const currentUser = await this.userService.getCurrentUserById(userId);
    if (!currentUser) {
      throw new UnauthorizedException('Invalid User');
    }

    request.currentUser = currentUser;

    return true;
  }
}
