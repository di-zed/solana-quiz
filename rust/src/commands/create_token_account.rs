use crate::services::solana_api::SolanaApi;
use anyhow::Result;

/// CLI command to create an associated token account for the authority.
///
/// This function creates a token account tied to the mint and authority
/// and prints the resulting transaction signature.
pub async fn run() -> Result<()> {
    match SolanaApi::new().create_token_account().await {
        Ok(signature) => println!("Transaction Signature: {}", signature),
        Err(err) => eprintln!("Error sending transaction: {}", err),
    }

    Ok(())
}
