/**
 * User Reward Type.
 */
export type UserReward = {
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  earnedTokens: number;
  streakDays: number;
  isSent: boolean;
};
