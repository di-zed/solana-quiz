import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { NonceResponseDto } from './dto/nonce-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  ApiCookieAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NonceService } from './nonce.service';
import { TokenService } from './token.service';
import { WalletService } from './wallet.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  public constructor(
    private authService: AuthService,
    private nonceService: NonceService,
    private walletService: WalletService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  @Public()
  @Get('nonce')
  @ApiOperation({ summary: 'Generate a nonce for login' })
  @ApiResponse({
    status: 200,
    description: 'Generated nonce',
    type: NonceResponseDto,
  })
  public nonce(): NonceResponseDto {
    return { nonce: this.nonceService.generate() };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login using wallet address and signature' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Invalid nonce' })
  public async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    this.nonceService.validate(loginDto.nonce);
    this.walletService.verify(loginDto);

    const user = await this.authService.authUser(loginDto.walletAddress);
    await this.updateTokens(res, user.id);

    return { user: this.userService.convertToCurrentUser(user) };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout the current user' })
  @ApiCookieAuth('auth_token')
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    type: LogoutResponseDto,
  })
  @ApiResponse({ status: 401, description: 'User is not logged in' })
  public logout(@Res({ passthrough: true }) res: Response): LogoutResponseDto {
    this.removeTokens(res);

    return {};
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access and refresh tokens using a valid refresh token',
  })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed. Returns updated user data.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing refresh token',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error',
  })
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const cookies = req.cookies as Record<string, string | undefined>;
    const refreshToken: string | undefined = cookies.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    let userId = 0;

    try {
      const refreshPayload =
        await this.tokenService.verifyRefreshToken(refreshToken);
      userId = refreshPayload.userId;

      await this.updateTokens(res, userId);
    } catch {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    const currentUser = await this.userService.getCurrentUserById(userId);
    if (!currentUser) {
      throw new UnauthorizedException('Invalid User');
    }

    return { user: currentUser };
  }

  /**
   * Generates new auth and refresh tokens and writes them to cookies.
   *
   * @param res Express response object used to set cookies.
   * @param userId ID of the user for whom tokens are generated.
   */
  private async updateTokens(res: Response, userId: number): Promise<void> {
    const [authToken, refreshToken] = await Promise.all([
      this.tokenService.generateAuthToken({ userId }, '1h'),
      this.tokenService.generateRefreshToken({ userId }, '30d'),
    ]);

    const isSecure = this.tokenService.isSecure();

    res.cookie('auth_token', authToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  /**
   * Removes auth and refresh cookies from the client.
   *
   * @param res Express response object used to clear cookies.
   */
  private removeTokens(res: Response): void {
    const isSecure = this.tokenService.isSecure();

    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
    });
  }
}
