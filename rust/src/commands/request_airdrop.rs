use crate::services::solana_api::SolanaApi;
use anyhow::Result;
use solana_program::pubkey::Pubkey;
use tracing::{error, info};

/// Runs the airdrop command.
///
/// # Arguments
/// * `sol_amount` - Amount of SOL to request in the airdrop (in SOL, not lamports).
/// * `pubkey` - Optional public key (as a string) to receive the airdrop.
///              If not provided, the authority keypair from the config is used.
///
/// # Returns
/// * `Result<()>` - Returns `Ok(())` if the airdrop request was successful,
///   or an error if something went wrong.
///
/// # Example
/// ```ignore
/// run(2, Some("YourPubkeyHere".to_string())).await?;
/// ```
pub async fn run(sol_amount: u64, pubkey: Option<String>) -> Result<()> {
    let parsed_pubkey = match pubkey {
        Some(addr) => Some(addr.parse::<Pubkey>()?),
        None => None,
    };

    match SolanaApi::new()
        .request_airdrop(sol_amount, &parsed_pubkey)
        .await
    {
        Ok(signature) => info!("Transaction Signature: {}", signature),
        Err(err) => error!("Error sending transaction: {}", err),
    }

    Ok(())
}
