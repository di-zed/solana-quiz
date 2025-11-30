import { UserReward } from './user-reward.type';

/**
 * User Reward Data Type.
 */
export type UserRewardData = {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  earnedTokens: number;
  streaks: number;
  rewards: UserReward[];
};
