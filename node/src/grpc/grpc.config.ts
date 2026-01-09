import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const getGrpcServerConfig = (
  config: ConfigService,
): MicroserviceOptions => ({
  transport: Transport.GRPC,
  options: {
    package: 'solana_quiz.v1',
    protoPath: join(__dirname, '../../grpc/proto/solana_quiz/v1/index.proto'),
    url: `0.0.0.0:${config.getOrThrow('NODE_GRPC_CONTAINER_PORT')}`,
  },
});
