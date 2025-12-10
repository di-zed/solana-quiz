import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService {
  public constructor(@Inject('KAFKA_SERVICE') private client: ClientKafka) {}

  // Fire-and-forget
  public emit(topic: string, payload: Record<string, any>, key?: string) {
    const message = key
      ? { key, value: JSON.stringify(payload) }
      : JSON.stringify(payload);

    return this.client.emit(topic, message);
  }
}
