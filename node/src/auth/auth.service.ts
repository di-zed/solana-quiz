import { Injectable } from '@nestjs/common';
import { User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service responsible for authentication-related operations.
 *
 * Handles user login, creation, and updates in the database.
 */
@Injectable()
export class AuthService {
  /**
   * AuthService constructor.
   *
   * @param prisma - PrismaService instance used to interact with the database
   */
  public constructor(
    private prisma: PrismaService
  ) {}

  /**
   * Authenticate a user by wallet address.
   *
   * If a user with the given wallet address exists, updates their `lastLoginAt` timestamp.
   * Otherwise, creates a new user record in the database.
   *
   * @param walletAddress - The user's wallet address
   * @returns The created or updated User object
   */
  public async authUser(walletAddress: string): Promise<User> {
    return this.prisma.user.upsert({
      where: { walletAddress: walletAddress },
      create: { walletAddress: walletAddress },
      update: { lastLoginAt: new Date() },
    });
  }
}