/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Provider.
 */
export class PrismaProvider {
  /**
   * Prisma Client.
   *
   * @protected
   */
  protected client: PrismaClient | undefined = undefined;

  /**
   * Get Prisma Client.
   *
   * @returns PrismaClient
   */
  public getClient(): PrismaClient {
    if (this.client === undefined) {
      this.client = new PrismaClient();
    }

    return this.client;
  }
}

export default new PrismaProvider();
