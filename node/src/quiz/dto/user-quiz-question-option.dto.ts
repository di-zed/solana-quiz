import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO representing a single answer option for a quiz question.
 */
export class UserQuizQuestionOptionDto {
  @ApiProperty({ description: 'Option ID', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Option text',
    example: 'Solana is a blockchain platform',
  })
  option: string;
}
