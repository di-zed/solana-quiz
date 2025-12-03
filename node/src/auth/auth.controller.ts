import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import {UserService} from "../user/user.service";
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { NonceResponseDto } from './dto/nonce-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NonceService } from './nonce.service';
import { WalletService } from './wallet.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  public constructor(
    private authService: AuthService,
    private nonceService: NonceService,
    private walletService: WalletService,
    private userService: UserService,
  ) {}

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

  @Post('login')
  @ApiOperation({ summary: 'Login using wallet address and signature' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Invalid nonce' })
  public async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    this.nonceService.validate(loginDto.nonce);
    this.walletService.verify(loginDto);

    const user = await this.authService.authUser(loginDto.walletAddress);

    console.log(user);

    // this.updateTokens(res, user.id);

    return { user: this.userService.convertToCurrentUser(user) };
  }
}
