import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserService } from './user.service';

@Module({
  exports: [UserService],
  imports: [PrismaModule],
  providers: [UserService],
})
export class UserModule {}
