import { Controller } from '@nestjs/common';
import { Payload, EventPattern } from '@nestjs/microservices';
import { KafkaConsumerAbstract } from '../../kafka/kafka-consumer.abstract';
import { REWARD_TOPICS } from '../../kafka/topics/reward-topics';
import { RewardService } from '../reward.service';
import type { SolanaQuizRewardApplied } from '../types/solana-quiz-reward-applied.type';

@Controller()
export class RewardConsumerController extends KafkaConsumerAbstract {
  public constructor(private rewardService: RewardService) {
    super();
  }

  @EventPattern(REWARD_TOPICS.REWARD_APPLIED)
  public async handleEvent(
    @Payload() message: SolanaQuizRewardApplied,
  ): Promise<void> {
    await this.rewardService.markRewardAsSent(message.user_id, message.quiz_id);
  }
}
