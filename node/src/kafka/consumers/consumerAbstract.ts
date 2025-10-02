/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { Consumer, ConsumerSubscribeTopics, KafkaMessage } from 'kafkajs';
import kafkaProvider from '../../providers/kafkaProvider';

/**
 * Consumer Abstract class.
 */
export default abstract class ConsumerAbstract {
  /**
   * Group ID.
   *
   * @protected
   */
  protected groupId: string;

  /**
   * Subscription.
   *
   * @protected
   */
  protected subscription: ConsumerSubscribeTopics;

  /**
   * Create a new consumer instance.
   *
   * @param groupId
   * @param subscription
   */
  public constructor(groupId: string, subscription: ConsumerSubscribeTopics) {
    this.groupId = groupId;
    this.subscription = subscription;
  }

  /**
   * Subscribes the consumer to the configured topics and starts
   * message processing loop using {@link handle}.
   *
   * @returns Promise<Consumer>
   */
  public async subscribe(): Promise<Consumer> {
    const consumer = await kafkaProvider.getConsumer(this.groupId);

    await consumer.subscribe(this.subscription);
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await this.handle(topic, partition, message);
      },
    });

    return consumer;
  }

  /**
   * Abstract message handler.
   *
   * @returns Promise<boolean>
   */
  public abstract handle(topic: string, partition: number, message: KafkaMessage): Promise<boolean>;
}
