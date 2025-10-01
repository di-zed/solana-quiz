use anyhow::Result;
use dotenv::dotenv;
use solana_quiz::commands;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    // Load environment variables from `.env` file into std::env.
    dotenv().ok();

    commands::run().await?;

    Ok(())
}
