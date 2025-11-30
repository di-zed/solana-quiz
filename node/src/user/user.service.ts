import { Injectable } from '@nestjs/common';
import { User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from './types/current-user.type';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get User by ID.
   *
   * @param userId
   * @returns Promise<User | null>
   */
  public async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  /**
   * Get User by Wallet Address.
   *
   * @param walletAddress
   * @returns Promise<User | null>
   */
  public async getUserByWalletAddress(
    walletAddress: string,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { walletAddress } });
  }

  /**
   * Prepare Current User by ID.
   *
   * @param userId
   * @returns Promise<CurrentUser | null>
   */
  public async prepareCurrentUserById(
    userId: number,
  ): Promise<CurrentUser | null> {
    const user = await this.getUserById(userId);

    if (!user) {
      return null;
    }

    return { id: user.id, wallet: user.walletAddress };
  }
}
