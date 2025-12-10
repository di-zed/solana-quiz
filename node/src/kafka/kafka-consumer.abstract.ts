import { Controller, OnModuleInit } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';

@Controller()
export abstract class KafkaConsumerAbstract implements OnModuleInit {
  /**
   * Called automatically when the module is initialized.
   * Logs the name of the subclass for debugging purposes.
   */
  public async onModuleInit() {
    console.log(`${this.constructor.name} initialized, subscribing...`);
  }

  /**
   * Abstract method that must be implemented by subclasses.
   * This is where the Kafka message processing logic goes.
   *
   * @param message - The payload of the Kafka message
   * @param context - Kafka context with metadata such as topic, partition, and offset
   *
   * Example usage in a subclass:
   *
   * @Controller()
   * export class RewardConsumerController extends KafkaConsumerAbstract {
   *   @EventPattern(REWARD_TOPICS.REWARD_APPLIED)
   *   public async handleEvent(@Payload() message: SolanaQuizRewardApplied, context: KafkaContext): Promise<void> {
   *     console.log('Received message:', message);
   *     console.log('Topic:', context.getTopic());
   *     console.log('Partition:', context.getPartition());
   *     console.log('Offset:', context.getMessage().offset);
   *   }
   * }
   */
  abstract handleEvent(message: any, context: KafkaContext): Promise<void>;
}
