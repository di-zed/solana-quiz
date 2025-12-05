import { ApiProperty } from '@nestjs/swagger';
import { UserRewardDataDto } from './user-reward-data.dto';

export class RewardsResponseDto {
  @ApiProperty({
    description: 'User reward data',
    type: UserRewardDataDto,
  })
  rewardData: UserRewardDataDto;
}
