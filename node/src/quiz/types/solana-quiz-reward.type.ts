/**
 * Represents a reward event in the Solana Quiz system.
 */
export type SolanaQuizReward = {
  /** Unique identifier of the user receiving the reward */
  user_id: number;

  /** Solana wallet address of the user, where tokens will be sent */
  user_wallet: string;

  /** Unique identifier of the quiz that was completed */
  quiz_id: number;

  /** Total number of questions in the quiz */
  total_questions: number;

  /** Number of questions answered correctly by the user */
  correct_answers: number;

  /** Number of tokens earned for completing the quiz */
  earned_tokens: number;

  /** Number of consecutive days the user has participated in quizzes */
  streak_days: number;
};
