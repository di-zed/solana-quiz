use crate::models::kafka::SolanaQuizReward;
use crate::services::blockchain_api::solana_quiz_rewards::accounts::QuizUserData;
use anyhow::Result;
use async_trait::async_trait;
use solana_sdk::signature::Signature;

pub mod solana_quiz_reward;

/// A trait that defines a Kafka consumer handler for a specific topic.
///
/// Each handler is responsible for:
/// - Returning the topic name it listens to (`topic()`).
/// - Processing incoming messages for that topic asynchronously (`handle()`).
///
/// `Send + Sync` ensures that handlers can be safely shared across threads,
/// which is required when running them inside async executors like Tokio.
///
/// The `async_trait` macro is used because Rust does not natively support
/// `async fn` inside traits. It generates the necessary boilerplate under the hood.
#[async_trait]
pub trait KafkaConsumerHandler: Send + Sync {
    /// Returns the Kafka topic that this handler is responsible for.
    fn topic(&self) -> &'static str;

    /// Handles an incoming Kafka message payload asynchronously.
    async fn handle(&self, payload: &str) -> Result<()>;

    /// Sends the earned tokens to the user's wallet via on-chain Solana transaction.
    async fn send_tokens_on_chain(&self, reward: &SolanaQuizReward) -> Result<QuizUserData>;

    /// Sends the earned tokens to the user's wallet via an off-chain mechanism.
    async fn send_tokens_off_chain(&self, reward: &SolanaQuizReward) -> Result<Signature>;

    /// Sends NFT rewards to the user based on their quiz performance and streak.
    async fn send_nft_rewards(&self, reward: &SolanaQuizReward) -> Result<()>;
}
