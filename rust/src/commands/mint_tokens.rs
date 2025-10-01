use crate::services::solana_api::SolanaApi;
use anyhow::Result;
use tracing::{error, info};

/// Mints tokens to the authority account.
///
/// # Arguments
/// * `amount` - Number of tokens to mint (before applying decimals).
///
/// Prints the transaction signature on success, or an error message otherwise.
pub async fn run(amount: u64) -> Result<()> {
    match SolanaApi::new().mint_tokens(amount).await {
        Ok(signature) => info!("Transaction Signature: {}", signature),
        Err(err) => error!("Error sending transaction: {}", err),
    }

    Ok(())
}
