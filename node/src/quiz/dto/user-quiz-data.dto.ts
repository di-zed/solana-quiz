import { ApiProperty } from '@nestjs/swagger';
import { UserQuizQuestionDto } from './user-quiz-question.dto';

/**
 * DTO representing user quiz data.
 */
export class UserQuizDataDto {
  @ApiProperty({ description: 'Whether the quiz is completed', example: false })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Total number of questions in the quiz',
    example: 1,
  })
  totalQuestions: number;

  @ApiProperty({ description: 'Number of correct answers', example: 0 })
  correctAnswers: number;

  @ApiProperty({ description: 'Number of wrong answers', example: 1 })
  wrongAnswers: number;

  @ApiProperty({
    type: [UserQuizQuestionDto],
    description: 'List of user quiz questions',
  })
  questions: UserQuizQuestionDto[];

  @ApiProperty({
    description: 'Number of tokens earned by the user',
    example: 0,
  })
  earnedTokens: number;

  @ApiProperty({
    description: 'Number of consecutive days in streak',
    example: 3,
  })
  streakDays: number;
}
