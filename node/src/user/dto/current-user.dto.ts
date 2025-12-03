import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Wallet address', example: 'F7a1...d9c3' })
  wallet: string;

  public constructor(partial: Partial<CurrentUserDto>) {
    Object.assign(this, partial);
  }
}
