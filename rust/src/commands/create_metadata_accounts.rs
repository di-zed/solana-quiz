use crate::services::solana_api::SolanaApi;
use anyhow::Result;
use tracing::{error, info};

/// Runs the process of creating metadata accounts for the token
/// using Metaplex Token Metadata program.
///
/// On success, prints the transaction signature.
/// On failure, prints the error message.
pub async fn run() -> Result<()> {
    match SolanaApi::new().create_metadata_accounts().await {
        Ok(signature) => info!("Transaction Signature: {}", signature),
        Err(err) => error!("Error sending transaction: {}", err),
    }

    Ok(())
}
