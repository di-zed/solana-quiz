import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO representing the result of answering a quiz question.
 */
export class AnswerResponseDto {
  @ApiProperty({
    description: 'Whether the selected answer is correct',
    example: true,
  })
  isCorrectAnswer: boolean;

  @ApiProperty({
    description: 'ID of the correct option',
    example: 2,
  })
  correctOptionId: number;

  @ApiProperty({
    description: 'ID of the option selected by the user',
    example: 2,
  })
  selectedOptionId: number;

  @ApiProperty({
    description: 'Whether the quiz has been completed after this answer',
    example: true,
  })
  isQuizCompleted: boolean;

  @ApiProperty({
    description: 'Number of tokens earned by the user after this answer',
    example: 10,
  })
  earnedTokens: number;

  @ApiProperty({
    description: 'Number of consecutive days in streak after this answer',
    example: 3,
  })
  streakDays: number;
}
