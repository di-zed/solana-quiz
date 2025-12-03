import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getRequiredEnv } from '../common/utils/config.utils';

@Injectable()
export class PrismaService extends PrismaClient {
  public constructor() {
    const adapter = new PrismaPg({
      connectionString: getRequiredEnv('DATABASE_URL'),
    });
    super({ adapter });
  }
}
