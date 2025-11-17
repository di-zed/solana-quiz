use serde::{Deserialize, Serialize};

/// Represents a reward earned by a user for completing a Solana quiz.
#[derive(Serialize, Deserialize, Debug)]
pub struct SolanaQuizReward {
    pub user_id: u64,
    pub user_wallet: String,
    pub quiz_id: u64,
    pub total_questions: u64,
    pub correct_answers: u64,
    pub earned_tokens: u64,
    pub streak_days: u8,
}

/// Represents a successfully applied Solana quiz reward.
///
/// This struct is sent to other services (e.g., Node.js) to indicate
/// that the reward for a given user and quiz has been processed.
#[derive(Serialize, Deserialize, Debug)]
pub struct SolanaQuizRewardApplied {
    pub user_id: u64,
    pub quiz_id: u64,
}
