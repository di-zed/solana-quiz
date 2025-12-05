import { ApiProperty } from '@nestjs/swagger';
import { UserQuizQuestionOptionDto } from './user-quiz-question-option.dto';

/**
 * DTO representing a single quiz question with its answer status and options.
 */
export class UserQuizQuestionDto {
  @ApiProperty({ description: 'Question ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Question text', example: 'What is Solana?' })
  question: string;

  @ApiProperty({
    description: 'Whether the question has been answered',
    example: false,
  })
  isAnswered: boolean;

  @ApiProperty({ description: 'Whether the answer is correct', example: false })
  isCorrect: boolean;

  @ApiProperty({
    type: [UserQuizQuestionOptionDto],
    description: 'List of possible answer options',
  })
  options: UserQuizQuestionOptionDto[];
}
