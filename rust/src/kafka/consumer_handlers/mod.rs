use anyhow::Result;
use async_trait::async_trait;

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
}
