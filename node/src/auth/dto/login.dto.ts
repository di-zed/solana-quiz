import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User wallet address', example: 'F6a1...XYZ' })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'Signature for authentication',
    example: '3hF9...abc',
  })
  @IsString()
  signature: string;

  @ApiProperty({
    description: 'Nonce to validate the request',
    example: '123456789',
  })
  @IsString()
  nonce: string;
}
