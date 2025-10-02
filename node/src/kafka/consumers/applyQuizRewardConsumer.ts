/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { KafkaMessage } from 'kafkajs';
import ConsumerAbstract from './consumerAbstract';
import quizService from '../../services/quizService';

/**
 * Apply Solana Quiz Reward.
 */
export default class ApplyQuizRewardConsumer extends ConsumerAbstract {
  /**
   * @inheritDoc
   */
  public async handle(topic: string, partition: number, message: KafkaMessage): Promise<boolean> {
    try {
      const value = message.value ? message.value.toString() : null;

      if (value) {
        const reward = JSON.parse(value) as SolanaQuizRewardApplied;
        await quizService.markRewardAsSent(reward.user_id, reward.quiz_id);
      }
    } catch {
      return false;
    }

    return true;
  }
}

/**
 * Solana Quiz Reward Applied Type.
 */
export type SolanaQuizRewardApplied = {
  user_id: number;
  quiz_id: number;
};
