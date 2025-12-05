import { Injectable } from '@nestjs/common';
import { User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserDto } from './dto/current-user.dto';

@Injectable()
export class UserService {
  /**
   * User Service Constructor.
   *
   * @param prisma - Prisma service for database access
   */
  public constructor(private prisma: PrismaService) {}

  /**
   * Get a user by its unique ID.
   *
   * @param userId - ID of the user
   * @returns Promise<User | null> - Returns the user or null if not found
   */
  public async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  /**
   * Get a user by its wallet address.
   *
   * @param walletAddress - Wallet address of the user
   * @returns Promise<User | null> - Returns the user or null if not found
   */
  public async getUserByWalletAddress(
    walletAddress: string,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { walletAddress } });
  }

  /**
   * Get the current user by ID.
   * Converts the user to a simplified CurrentUserDto object.
   *
   * @param userId - ID of the user
   * @returns Promise<CurrentUserDto | null> - Returns the current user or null if not found
   */
  public async getCurrentUserById(
    userId: number,
  ): Promise<CurrentUserDto | null> {
    const user = await this.getUserById(userId);
    return user ? this.convertToCurrentUser(user) : null;
  }

  /**
   * Convert a User entity to a simplified CurrentUserDto type.
   *
   * @param user - User entity from the database
   * @returns CurrentUserDto - Simplified user object with only essential fields
   */
  public convertToCurrentUser(user: User): CurrentUserDto {
    return { id: user.id, wallet: user.walletAddress };
  }
}
