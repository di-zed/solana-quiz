use crate::services::solana_api::SolanaApi;
use anyhow::Result;
use solana_program::pubkey::Pubkey;

/// Sends the specified amount of tokens to the given recipient address.
///
/// # Arguments
/// * `recipient` — recipient's public key as a string.
/// * `amount` — number of tokens to transfer (without decimals).
///
/// Prints the transaction signature on success, or an error message otherwise.
pub async fn run(recipient: String, amount: u64) -> Result<()> {
    match SolanaApi::new()
        .send_tokens(&recipient.parse::<Pubkey>()?, amount)
        .await
    {
        Ok(signature) => println!("Transaction Signature: {}", signature),
        Err(err) => eprintln!("Error sending transaction: {}", err),
    }

    Ok(())
}
