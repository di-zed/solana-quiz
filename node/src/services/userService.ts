/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { User } from '@prisma/client';
import prismaProvider from '../providers/prismaProvider';

/**
 * User Service.
 */
class UserService {
  /**
   * Get User by ID.
   *
   * @param userId
   * @returns Promise<User | null>
   */
  public async getUserById(userId: number): Promise<User | null> {
    return await prismaProvider.getClient().user.findUnique({ where: { id: userId } });
  }

  /**
   * Get User by Wallet Address.
   *
   * @param walletAddress
   * @returns Promise<User | null>
   */
  public async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    return await prismaProvider.getClient().user.findUnique({ where: { walletAddress } });
  }

  /**
   * Prepare Current User by ID.
   *
   * @param userId
   * @returns Promise<CurrentUser | null>
   */
  public async prepareCurrentUserById(userId: number): Promise<CurrentUser | null> {
    const user = await this.getUserById(userId);

    if (!user) {
      return null;
    }

    return { id: user.id, wallet: user.walletAddress };
  }
}

/**
 * Authenticated User Type.
 */
export type CurrentUser = {
  id: number;
  wallet: string;
};

export default new UserService();
