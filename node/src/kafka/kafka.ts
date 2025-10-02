/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */

import ApplyQuizRewardConsumer from './consumers/applyQuizRewardConsumer';

/**
 * Kafka class.
 */
export default class Kafka {
  /**
   * Run Kafka.
   *
   * @returns boolean
   */
  public run(): boolean {
    const applyQuizRewardConsumer = new ApplyQuizRewardConsumer('solana-quiz', {
      topics: ['solana-quiz-reward-applied'],
      fromBeginning: true,
    });
    applyQuizRewardConsumer.subscribe().then((): void => {});

    return true;
  }
}
