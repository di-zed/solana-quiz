use crate::kafka::config::create_kafka_producer_config;
use anyhow::Result;
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::util::Timeout;
use std::sync::Arc;
use tracing::{error, info};

/// KafkaProducer is a wrapper around rdkafka FutureProducer.
/// It provides a convenient API to send messages to Kafka topics.
pub struct KafkaProducer {
    producer: Arc<FutureProducer>,
}

impl KafkaProducer {
    /// Creates a new KafkaProducer instance with configured FutureProducer.
    pub fn new() -> Self {
        let producer_config = create_kafka_producer_config();
        let producer = producer_config.create().expect("Producer creation failed");

        Self {
            producer: Arc::new(producer),
        }
    }

    /// Returns the underlying producer (cloned Arc).
    pub fn get_producer(&self) -> Arc<FutureProducer> {
        Arc::clone(&self.producer)
    }

    /// Sends a message asynchronously to the given Kafka topic.
    pub async fn send(&self, topic: &str, key: &str, payload: &str) -> Result<()> {
        let record: FutureRecord<str, str> = FutureRecord::to(topic).key(key).payload(payload);
        let producer = self.get_producer();

        match producer.send(record, Timeout::Never).await {
            Ok(delivery) => {
                info!("Message delivered: {:?}", delivery);
                Ok(())
            }
            Err((e, _)) => {
                error!("Failed to deliver message: {:?}", e);
                Err(anyhow::anyhow!(e))
            }
        }
    }
}
