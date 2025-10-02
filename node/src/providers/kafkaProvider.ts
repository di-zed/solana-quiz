/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { Consumer, Kafka, Producer, ProducerRecord, RecordMetadata } from 'kafkajs';
import configUtil from '../utils/configUtil';

export class KafkaProvider {
  /**
   * Kafka Client.
   *
   * @protected
   */
  protected client: Kafka | undefined = undefined;

  /**
   * Kafka Consumer.
   *
   * @protected
   */
  protected consumers: Record<string, Consumer> = {};

  /**
   * Kafka Producer.
   *
   * @protected
   */
  protected producer: Producer | undefined = undefined;

  /**
   * Get Kafka Client.
   *
   * @returns Kafka
   */
  public getClient(): Kafka {
    if (this.client === undefined) {
      this.client = new Kafka({
        clientId: 'solana-quiz-node',
        brokers: [`kafka1:${configUtil.getRequiredEnv('KAFKA1_CONTAINER_PORT')}`],
      });
    }

    return this.client;
  }

  /**
   * Get Connected Kafka Consumer.
   *
   * @param groupId
   * @returns Promise<Consumer>
   */
  public async getConsumer(groupId: string): Promise<Consumer> {
    if (this.consumers[groupId] === undefined) {
      this.consumers[groupId] = this.getClient().consumer({ groupId });
      await this.consumers[groupId].connect();
    }

    return this.consumers[groupId];
  }

  /**
   * Get Connected Kafka Producer.
   *
   * @returns Promise<Producer>
   */
  public async getProducer(): Promise<Producer> {
    if (this.producer === undefined) {
      this.producer = this.getClient().producer();
      await this.producer.connect();
    }

    return this.producer;
  }

  /**
   * Disconnect Consumer.
   *
   * @param groupId
   * @returns Promise<boolean>
   */
  public async disconnectConsumer(groupId: string): Promise<boolean> {
    if (this.consumers[groupId] !== undefined) {
      await this.consumers[groupId].disconnect();
      delete this.consumers[groupId];

      return true;
    }

    return false;
  }

  /**
   * Disconnect Producer.
   *
   * @returns Promise<boolean>
   */
  public async disconnectProducer(): Promise<boolean> {
    if (this.producer !== undefined) {
      await this.producer.disconnect();
      this.producer = undefined;

      return true;
    }

    return false;
  }

  /**
   * Send Messages.
   *
   * @param record
   * @returns Promise<RecordMetadata[]>
   */
  public async sendMessages(record: ProducerRecord): Promise<RecordMetadata[]> {
    return await (await this.getProducer()).send(record);
  }
}

export default new KafkaProvider();
