import { ApiProperty } from '@nestjs/swagger';
import { UserRewardDto } from './user-reward.dto';

/**
 * DTO representing aggregated user reward data.
 */
export class UserRewardDataDto {
  @ApiProperty({ description: 'Total number of quizzes completed', example: 5 })
  totalQuizzes: number;

  @ApiProperty({
    description: 'Total number of questions answered',
    example: 25,
  })
  totalQuestions: number;

  @ApiProperty({ description: 'Total number of correct answers', example: 22 })
  correctAnswers: number;

  @ApiProperty({ description: 'Total number of wrong answers', example: 3 })
  wrongAnswers: number;

  @ApiProperty({ description: 'Total earned tokens', example: 42 })
  earnedTokens: number;

  @ApiProperty({
    description: 'Current streak of consecutive days',
    example: 5,
  })
  streaks: number;

  @ApiProperty({ description: 'List of rewards', type: [UserRewardDto] })
  rewards: UserRewardDto[];
}
