import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

/**
 * DTO representing the body of a request to answer a quiz question.
 */
export class AnswerBodyDto {
  @ApiProperty({
    description: 'ID of the question being answered',
    example: 1,
  })
  @IsInt({ message: 'questionId must be an integer' })
  @Min(1, { message: 'questionId must be greater than 0' })
  questionId: number;

  @ApiProperty({
    description: 'ID of the option selected by the user',
    example: 2,
  })
  @IsInt({ message: 'optionId must be an integer' })
  @Min(1, { message: 'optionId must be greater than 0' })
  optionId: number;
}
