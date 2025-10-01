use crate::utils::config_util::get_required_env;
use rdkafka::ClientConfig;

/// Creates Kafka producer config.
/// - Uses `KAFKA1_CONTAINER_PORT` env var for broker port.
/// - Sets message timeout to 5000 ms (fail if broker does not ack within 5 sec).
pub fn create_kafka_producer_config() -> ClientConfig {
    let kafka_port =
        get_required_env("KAFKA1_CONTAINER_PORT").expect("KAFKA1_CONTAINER_PORT is not set");
    let mut config = ClientConfig::new();

    config
        .set("bootstrap.servers", format!("kafka1:{}", kafka_port))
        .set("message.timeout.ms", "5000");

    config
}

/// Creates Kafka consumer config.
/// - Uses `KAFKA1_CONTAINER_PORT` env var for broker port.
/// - Sets fixed group id `solana_quiz_group`.
/// - Disables auto commit (manual offset commit required).
pub fn create_kafka_consumer_config() -> ClientConfig {
    let kafka_port =
        get_required_env("KAFKA1_CONTAINER_PORT").expect("KAFKA1_CONTAINER_PORT is not set");
    let mut config = ClientConfig::new();

    config
        .set("bootstrap.servers", format!("kafka1:{}", kafka_port))
        .set("group.id", "solana_quiz_group")
        .set("enable.auto.commit", "false");

    config
}
