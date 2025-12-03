import { ApiProperty } from '@nestjs/swagger';
import { CurrentUserDto } from '../../user/dto/current-user.dto';

export class LoginResponseDto {
  @ApiProperty({ type: CurrentUserDto, description: 'Logged in user data' })
  user: CurrentUserDto;
}
