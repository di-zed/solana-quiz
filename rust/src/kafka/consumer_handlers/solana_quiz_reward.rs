use crate::kafka::consumer_handlers::KafkaConsumerHandler;
use crate::kafka::producer::KafkaProducer;
use crate::models::kafka::{SolanaQuizReward, SolanaQuizRewardApplied};
use crate::services::blockchain_api::BlockchainApi;
use crate::services::blockchain_api::solana_quiz_rewards::accounts::QuizUserData;
use crate::services::nft_api::NftApi;
use crate::services::solana_api::SolanaApi;
use crate::utils::solana_util::{get_solana_on_chain, get_solana_streak_days};
use anyhow::Result;
use async_trait::async_trait;
use solana_program::pubkey::Pubkey;
use solana_sdk::signature::Signature;
use std::sync::Arc;
use tokio::runtime::Handle;
use tokio::task;
use tracing::{error, info};

pub struct SolanaQuizRewardHandler {
    producer: Arc<KafkaProducer>,
}

impl SolanaQuizRewardHandler {
    pub fn new(producer: Arc<KafkaProducer>) -> Self {
        Self { producer }
    }
}

/// Handler for the "solana-quiz-rewards" Kafka topic.
///
/// Deserializes incoming `SolanaQuizReward` messages and sends
/// the earned tokens to the user's wallet via Solana API.
#[async_trait]
impl KafkaConsumerHandler for SolanaQuizRewardHandler {
    fn topic(&self) -> &'static str {
        "solana-quiz-rewards"
    }

    async fn handle(&self, payload: &str) -> Result<()> {
        match serde_json::from_str::<SolanaQuizReward>(payload) {
            Ok(reward) => {
                info!("Received Quiz Reward: {:?}", reward);

                let streak_days: u8;

                if get_solana_on_chain() {
                    let quiz_user_data_account = self.send_tokens_on_chain(&reward).await?;
                    streak_days = quiz_user_data_account.streak;
                } else {
                    self.send_tokens_off_chain(&reward).await?;
                    streak_days = reward.streak_days;
                }

                let confirmation = SolanaQuizRewardApplied {
                    user_id: reward.user_id,
                    quiz_id: reward.quiz_id,
                };
                let payload = serde_json::to_string(&confirmation)?;

                self.producer
                    .send(
                        "solana-quiz-reward-applied",
                        &format!("user_{}", reward.user_id),
                        &payload,
                    )
                    .await?;

                if streak_days == get_solana_streak_days() {
                    self.send_nft_rewards(&reward).await?;
                }
            }
            Err(e) => error!("Failed to deserialize Quiz Reward: {}", e),
        }

        Ok(())
    }

    async fn send_tokens_on_chain(&self, reward: &SolanaQuizReward) -> Result<QuizUserData> {
        let user_wallet = reward.user_wallet.parse::<Pubkey>()?;

        let total_questions = reward.total_questions;
        let correct_answers = reward.correct_answers;
        let earned_tokens = reward.earned_tokens;

        info!("Starting on-chain reward transaction for {}", user_wallet);
        let start = std::time::Instant::now();

        let handle = Handle::current();

        let quiz_user_data_account: QuizUserData = task::spawn_blocking(move || {
            handle.block_on(async {
                let blockchain_api = BlockchainApi::new();
                blockchain_api
                    .call_program_rewards(
                        &user_wallet,
                        total_questions,
                        correct_answers,
                        earned_tokens,
                    )
                    .await
            })
        })
        .await??;

        info!("On-chain transaction completed in {:.2?}", start.elapsed());

        Ok(quiz_user_data_account)
    }

    async fn send_tokens_off_chain(&self, reward: &SolanaQuizReward) -> Result<Signature> {
        let signature = SolanaApi::new()
            .send_tokens(&reward.user_wallet.parse::<Pubkey>()?, reward.earned_tokens)
            .await?;

        info!("Transaction Signature: {}", signature);

        Ok(signature)
    }

    async fn send_nft_rewards(&self, reward: &SolanaQuizReward) -> Result<()> {
        NftApi::new()
            .mint_nft_to_recipient(&reward.user_wallet.parse::<Pubkey>()?)
            .await?;

        Ok(())
    }
}
