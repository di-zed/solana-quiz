import { NodeClickHouseClientConfigOptions } from '@clickhouse/client/dist/config';
import { ConfigService } from '@nestjs/config';

export const getClickHouseConfig = (
  config: ConfigService,
): NodeClickHouseClientConfigOptions => ({
  url: `${config.getOrThrow('CLICKHOUSE_HOST')}:${config.getOrThrow('CLICKHOUSE_CONTAINER_PORT')}`,
  username: config.getOrThrow('CLICKHOUSE_USER'),
  password: config.getOrThrow('CLICKHOUSE_PASSWORD'),
  database: config.getOrThrow('CLICKHOUSE_DB'),
});
