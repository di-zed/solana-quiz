use crate::services::solana_api::SolanaApi;
use anyhow::Result;

pub async fn run(amount: u64) -> Result<()> {
    match SolanaApi::new().mint_tokens(amount).await {
        Ok(signature) => println!("Transaction Signature: {}", signature),
        Err(err) => eprintln!("Error sending transaction: {}", err),
    }

    Ok(())
}
