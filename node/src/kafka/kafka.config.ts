import { ConfigService } from '@nestjs/config';
import {
  ClientProviderOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';

export const getKafkaConsumerConfig = (
  config: ConfigService,
): MicroserviceOptions => ({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'solana-quiz-node-consumer',
      brokers: [`kafka1:${config.getOrThrow('KAFKA1_CONTAINER_PORT')}`],
    },
    consumer: {
      groupId: 'solana-quiz-nest',
    },
  },
});

export const getKafkaProducerConfig = (
  config: ConfigService,
): ClientProviderOptions => ({
  name: 'KAFKA_SERVICE',
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'solana-quiz-node-producer',
      brokers: [`kafka1:${config.getOrThrow('KAFKA1_CONTAINER_PORT')}`],
    },
    consumer: {
      groupId: 'solana-quiz-nest',
    },
    producer: {
      allowAutoTopicCreation: true,
      retry: {
        retries: 5,
      },
    },
  },
});
