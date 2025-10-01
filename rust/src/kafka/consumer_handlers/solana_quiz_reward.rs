use crate::kafka::consumer_handlers::KafkaConsumerHandler;
use crate::kafka::producer::KafkaProducer;
use crate::models::kafka::{SolanaQuizReward, SolanaQuizRewardApplied};
use crate::services::solana_api::SolanaApi;
use anyhow::Result;
use async_trait::async_trait;
use solana_program::pubkey::Pubkey;
use std::sync::Arc;
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

                match SolanaApi::new()
                    .send_tokens(&reward.user_wallet.parse::<Pubkey>()?, reward.earned_tokens)
                    .await
                {
                    Ok(signature) => {
                        info!("Transaction Signature: {}", signature);

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
                    }
                    Err(err) => error!("Error sending transaction: {}", err),
                }
            }
            Err(e) => error!("Failed to deserialize Quiz Reward: {}", e),
        }

        Ok(())
    }
}
