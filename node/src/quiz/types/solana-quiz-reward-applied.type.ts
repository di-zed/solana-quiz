/**
 * Represents the event when a reward for a Solana Quiz has been applied to a user.
 */
export type SolanaQuizRewardApplied = {
  /** Unique identifier of the user who received the reward */
  user_id: number;

  /** Unique identifier of the quiz for which the reward was applied */
  quiz_id: number;
};
