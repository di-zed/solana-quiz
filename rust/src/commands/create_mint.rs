use crate::services::solana_api::SolanaApi;
use anyhow::Result;

pub async fn run() -> Result<()> {
    match SolanaApi::new().create_mint().await {
        Ok(signature) => println!("Transaction Signature: {}", signature),
        Err(err) => eprintln!("Error sending transaction: {}", err),
    }

    Ok(())
}
