import { Controller, Get } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserDto } from './dto/current-user.dto';

@Controller('user')
@ApiTags('user')
@ApiCookieAuth('auth_token')
export class UserController {
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns current authenticated user',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid auth cookie',
  })
  public me(@CurrentUser() user: CurrentUserDto): LoginResponseDto {
    return { user };
  }
}
