use anyhow::Result;
use dotenv::dotenv;
use solana_quiz::kafka;
use tracing::{error, info};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    // Load environment variables from `.env` file into std::env.
    dotenv().ok();

    info!("Starting application...");

    let kafka_task = tokio::spawn(async move {
        if let Err(e) = kafka::run().await {
            error!("Kafka consumer error: {:?}", e);
        }
    });

    tokio::signal::ctrl_c().await?;
    info!("Received Ctrl+C, shutting down...");

    kafka_task.abort();

    info!("Application stopped");

    Ok(())
}
