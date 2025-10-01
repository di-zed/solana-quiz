use crate::services::solana_api::SolanaApi;
use anyhow::Result;
use tracing::{error, info};

/// CLI command to create a new SPL token mint.
///
/// This function initializes the mint account on Solana and prints
/// the resulting transaction signature.
pub async fn run() -> Result<()> {
    match SolanaApi::new().create_mint().await {
        Ok(signature) => info!("Transaction Signature: {}", signature),
        Err(err) => error!("Error sending transaction: {}", err),
    }

    Ok(())
}
