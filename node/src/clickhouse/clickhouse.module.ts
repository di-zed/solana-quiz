import { Module } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { ConfigService } from '@nestjs/config';
import { getClickHouseConfig } from './clickhouse.config';
import { ClickHouseService } from './clickhouse.service';

@Module({
  providers: [
    {
      provide: 'CLICKHOUSE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return createClient(getClickHouseConfig(config));
      },
    },
    ClickHouseService,
  ],
  exports: ['CLICKHOUSE', ClickHouseService],
})
export class ClickHouseModule {}
