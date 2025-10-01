use crate::kafka::config::create_kafka_consumer_config;
use crate::kafka::consumer_handlers::KafkaConsumerHandler;
use crate::kafka::consumer_handlers::solana_quiz_reward::SolanaQuizRewardHandler;
use crate::kafka::producer::KafkaProducer;
use rdkafka::Message;
use rdkafka::consumer::{CommitMode, Consumer, StreamConsumer};
use std::collections::HashMap;
use std::sync::Arc;
use tracing::error;

/// KafkaConsumer is a wrapper around a Kafka StreamConsumer.
/// It provides methods to create the consumer, register handlers,
/// and process messages from Kafka topics asynchronously.
pub struct KafkaConsumer {
    consumer: StreamConsumer,
}

impl KafkaConsumer {
    /// Creates a new instance of KafkaConsumer.
    pub fn new() -> Self {
        let consumer_config = create_kafka_consumer_config();
        let consumer: StreamConsumer = consumer_config.create().expect("Consumer creation failed");

        Self { consumer }
    }

    /// Returns a new StreamConsumer with configuration
    /// from `create_kafka_consumer_config`.
    pub fn get_consumer(&self) -> &StreamConsumer {
        &self.consumer
    }

    /// Returns a list of handlers for Kafka topics.
    /// Each handler implements the `KafkaConsumerHandler` trait.
    pub fn get_handlers(&self, producer: Arc<KafkaProducer>) -> Vec<Box<dyn KafkaConsumerHandler>> {
        vec![Box::new(SolanaQuizRewardHandler::new(producer.clone()))]
    }

    /// Subscribes to topics of all handlers and continuously consumes messages.
    /// Dispatches each message to the appropriate handler based on the topic.
    pub async fn consume_events(
        &self,
        consumer: &StreamConsumer,
        handlers: &[Box<dyn KafkaConsumerHandler>],
    ) {
        // Extract topics from handlers
        let topics: Vec<&str> = handlers.iter().map(|handler| handler.topic()).collect();

        // Subscribe to all topics
        consumer
            .subscribe(&topics)
            .expect("Failed to subscribe to Kafka topic");

        // Map topic -> handler for a quick lookup
        let mut map: HashMap<&str, &Box<dyn KafkaConsumerHandler>> = HashMap::new();
        for handler in handlers {
            map.insert(handler.topic(), handler);
        }

        // Infinite loop to consume messages
        loop {
            match consumer.recv().await {
                Ok(message) => {
                    match message.payload_view::<str>() {
                        Some(Ok(payload)) => {
                            let topic = message.topic();

                            // Dispatch to the correct handler
                            if let Some(handler) = map.get(topic) {
                                if let Err(e) = handler.handle(payload).await {
                                    error!("Error while handling message: {:?}", e);
                                }
                            } else {
                                error!("No handler for topic {}", topic);
                            }

                            // Commit the message offset
                            if let Err(e) = consumer.commit_message(&message, CommitMode::Async) {
                                error!("Failed to commit message: {}", e);
                            }

                            payload
                        }
                        Some(Err(e)) => {
                            error!("Error while deserializing message payload: {:?}", e);
                            ""
                        }
                        None => "",
                    };
                }
                Err(e) => error!("Kafka Consumer Error: {}", e),
            }
        }
    }
}
