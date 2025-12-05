import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO representing a user's reward for a quiz session.
 */
export class UserRewardDto {
  @ApiProperty({ description: 'Date of the reward', example: '2025-12-05' })
  date: string;

  @ApiProperty({
    description: 'Total number of questions in the quiz',
    example: 5,
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Number of correctly answered questions',
    example: 4,
  })
  correctAnswers: number;

  @ApiProperty({
    description: 'Number of incorrectly answered questions',
    example: 1,
  })
  wrongAnswers: number;

  @ApiProperty({ description: 'Tokens earned in this quiz', example: 4 })
  earnedTokens: number;

  @ApiProperty({
    description: 'Current streak of consecutive days',
    example: 5,
  })
  streakDays: number;

  @ApiProperty({
    description: 'Whether the reward has been sent',
    example: true,
  })
  isSent: boolean;
}
