import { ApiProperty } from '@nestjs/swagger';

export class NonceResponseDto {
  @ApiProperty({
    description: 'Generated nonce for login',
    example: '123456789',
  })
  nonce: string;
}
