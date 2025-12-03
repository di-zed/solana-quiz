import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NonceService } from './nonce.service';
import { WalletService } from './wallet.service';
import { TokenService } from './token.service';

@Module({
  imports: [JwtModule, UserModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, NonceService, WalletService, TokenService],
})
export class AuthModule {}
