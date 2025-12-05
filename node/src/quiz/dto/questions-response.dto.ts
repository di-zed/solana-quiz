import { ApiProperty } from '@nestjs/swagger';
import { UserQuizDataDto } from './user-quiz-data.dto';

export class QuestionsResponseDto {
  @ApiProperty({ type: UserQuizDataDto, description: 'User quiz data' })
  quizData: UserQuizDataDto;
}
