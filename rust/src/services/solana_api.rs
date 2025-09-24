use crate::utils::solana_util;
use anyhow::Result;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_program::{
    native_token::LAMPORTS_PER_SOL, program_pack::Pack, pubkey::Pubkey,
    system_instruction::create_account,
};
use solana_sdk::signature::{Keypair, Signature};
use solana_sdk::{signer::Signer, transaction::Transaction};
use spl_token::{ID as TOKEN_PROGRAM_ID, instruction::initialize_mint2, state::Mint};

pub struct SolanaApi {
    rpc_client: RpcClient,
    authority_keypair: Keypair,
    mint_account: Keypair,
}

/// High-level API wrapper for a Solana client and keypairs.
///
/// Encapsulates:
/// - An async Solana `RpcClient`
/// - The authority keypair (from environment)
/// - The mint account keypair (from environment)
///
/// Provides convenience methods such as requesting an airdrop.
impl SolanaApi {
    /// Creates a new instance using environment variables.
    pub fn new() -> Self {
        let rpc_client = solana_util::create_rpc_client();
        let authority_keypair = solana_util::get_authority_keypair();
        let mint_account = solana_util::get_mint_account();

        Self {
            rpc_client,
            authority_keypair,
            mint_account,
        }
    }

    /// Creates a new instance with custom parameters (useful for testing).
    pub fn with_params(
        rpc_client: RpcClient,
        authority_keypair: Keypair,
        mint_account: Keypair,
    ) -> Self {
        Self {
            rpc_client,
            authority_keypair,
            mint_account,
        }
    }

    /// Requests an airdrop of SOL and waits for confirmation.
    ///
    /// # Arguments
    /// * `sol_amount` - amount of SOL to request
    /// * `pubkey` - pubkey to receive SOL
    ///
    /// # Returns
    /// * `Signature` of the airdrop transaction
    pub async fn request_airdrop(
        &self,
        sol_amount: u64,
        pubkey: &Option<Pubkey>,
    ) -> Result<Signature> {
        let final_pubkey = pubkey.unwrap_or_else(|| self.authority_keypair.pubkey());

        let transaction_signature = self
            .rpc_client
            .request_airdrop(&final_pubkey, &sol_amount * LAMPORTS_PER_SOL)
            .await?;
        loop {
            if self
                .rpc_client
                .confirm_transaction(&transaction_signature)
                .await?
            {
                break;
            }
        }

        Ok(transaction_signature)
    }

    /// Creates a new mint account and initializes it.
    ///
    /// # Returns
    /// * `Signature` of the mint creation transaction
    pub async fn create_mint(&self) -> Result<Signature> {
        let mint_account_len = Mint::LEN;
        let mint_account_rent = self
            .rpc_client
            .get_minimum_balance_for_rent_exemption(mint_account_len)
            .await?;

        let create_mint_account_ix = create_account(
            &self.authority_keypair.pubkey(),
            &self.mint_account.pubkey(),
            mint_account_rent,
            mint_account_len as u64,
            &TOKEN_PROGRAM_ID,
        );

        let initialize_mint_ix = initialize_mint2(
            &TOKEN_PROGRAM_ID,
            &self.mint_account.pubkey(),
            &self.authority_keypair.pubkey(),
            Some(&self.authority_keypair.pubkey()),
            9,
        )?;

        let mut transaction = Transaction::new_with_payer(
            &[create_mint_account_ix, initialize_mint_ix],
            Some(&self.authority_keypair.pubkey()),
        );

        transaction.sign(
            &[&self.authority_keypair, &self.mint_account],
            self.rpc_client.get_latest_blockhash().await?,
        );

        let transaction_signature = self
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(transaction_signature)
    }
}
