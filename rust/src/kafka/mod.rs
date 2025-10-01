use crate::kafka::consumer::KafkaConsumer;
use crate::kafka::producer::KafkaProducer;
use anyhow::Result;
use std::sync::Arc;

pub mod config;
pub mod consumer;
pub mod consumer_handlers;
pub mod producer;

/// Starts the Kafka service and propagates any errors.
/// This function typically runs for the lifetime of the application.
pub async fn run() -> Result<()> {
    let kafka_producer = Arc::new(KafkaProducer::new());

    let kafka_consumer = KafkaConsumer::new();
    let consumer = kafka_consumer.get_consumer();
    let handlers = kafka_consumer.get_handlers(Arc::clone(&kafka_producer));

    kafka_consumer.consume_events(&consumer, &handlers).await;

    Ok(())
}
