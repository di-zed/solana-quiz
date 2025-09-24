use crate::utils::solana_util;
use anyhow::Result;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_program::{
    native_token::LAMPORTS_PER_SOL, program_pack::Pack, pubkey::Pubkey,
    system_instruction::create_account,
};
use solana_sdk::{
    signature::{Keypair, Signature},
    signer::Signer,
    transaction::Transaction,
};
use spl_associated_token_account::{
    get_associated_token_address, instruction::create_associated_token_account_idempotent,
};
use spl_token::{
    ID as TOKEN_PROGRAM_ID,
    instruction::{initialize_mint2, mint_to_checked, transfer_checked},
    state::Mint,
};

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
    pub fn _with_params(
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
    /// [Getting Test SOL](https://solana.com/developers/cookbook/development/test-sol)
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
        // Determine which pubkey will receive the SOL
        let final_pubkey = pubkey.unwrap_or_else(|| self.authority_keypair.pubkey());

        // Request the airdrop
        let transaction_signature = self
            .rpc_client
            .request_airdrop(&final_pubkey, sol_amount * LAMPORTS_PER_SOL)
            .await?;

        // Wait until transaction is confirmed
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
    /// [How to Create a Token](https://solana.com/developers/cookbook/tokens/create-mint-account)
    ///
    /// # Returns
    /// * `Signature` of the mint creation transaction
    pub async fn create_mint(&self) -> Result<Signature> {
        let mint_account_len = Mint::LEN;
        let mint_account_rent = self
            .rpc_client
            .get_minimum_balance_for_rent_exemption(mint_account_len)
            .await?;

        // Instruction to create a new account for the mint
        let create_mint_account_ix = create_account(
            &self.authority_keypair.pubkey(), // payer: pays rent for the new account
            &self.mint_account.pubkey(),      // new mint account pubkey
            mint_account_rent,                // minimum rent-exempt balance
            mint_account_len as u64,          // size of the mint account
            &TOKEN_PROGRAM_ID,                // SPL token program
        );

        // Instruction to initialize the mint
        let initialize_mint_ix = initialize_mint2(
            &TOKEN_PROGRAM_ID,                      // SPL token program
            &self.mint_account.pubkey(),            // mint account to initialize
            &self.authority_keypair.pubkey(),       // mint authority
            Some(&self.authority_keypair.pubkey()), // freeze authority (optional)
            9,                                      // decimals
        )?;

        // Create a transaction with the above instructions
        let mut transaction = Transaction::new_with_payer(
            &[create_mint_account_ix, initialize_mint_ix],
            Some(&self.authority_keypair.pubkey()),
        );

        // Sign transaction with authority and mint keypairs
        transaction.sign(
            &[&self.authority_keypair, &self.mint_account],
            self.rpc_client.get_latest_blockhash().await?,
        );

        // Send and confirm transaction
        let transaction_signature = self
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(transaction_signature)
    }

    /// Creates an associated token account for the authority keypair
    /// and initializes it to hold tokens of the mint.
    ///
    /// [How to Create a Token Account](https://solana.com/developers/cookbook/tokens/create-token-account)
    ///
    /// # Returns
    /// * `Signature` of the transaction that created the token account.
    pub async fn create_token_account(&self) -> Result<Signature> {
        // Instruction to create an associated token account if it doesn't exist
        let create_ata_ix = create_associated_token_account_idempotent(
            &self.authority_keypair.pubkey(), // payer
            &self.authority_keypair.pubkey(), // wallet to hold tokens
            &self.mint_account.pubkey(),      // mint of the token
            &TOKEN_PROGRAM_ID,                // SPL token program
        );

        // Build transaction with the instruction
        let mut transaction =
            Transaction::new_with_payer(&[create_ata_ix], Some(&self.authority_keypair.pubkey()));

        // Sign transaction with authority keypair
        transaction.sign(
            &[&self.authority_keypair],
            self.rpc_client.get_latest_blockhash().await?,
        );

        // Send transaction and wait for confirmation
        let transaction_signature = self
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(transaction_signature)
    }

    /// Mints `amount` tokens to the authority's associated token account.
    /// The amount is adjusted according to the mint's decimals.
    ///
    /// [How to Mint Tokens](https://solana.com/developers/cookbook/tokens/mint-tokens)
    ///
    /// # Arguments
    /// * `amount` - number of tokens to mint (whole units)
    ///
    /// # Returns
    /// * `Signature` of the mint transaction
    pub async fn mint_tokens(&self, amount: u64) -> Result<Signature> {
        // Compute the associated token account for the authority
        let associated_token_account = get_associated_token_address(
            &self.authority_keypair.pubkey(),
            &self.mint_account.pubkey(),
        );

        // Fetch the number of decimals for this token from the account
        let mint_decimals = self
            .rpc_client
            .get_token_account_balance(&associated_token_account)
            .await?
            .decimals;

        // Convert the requested amount to the smallest unit based on decimals
        let amount_to_mint = amount * 10_u64.pow(mint_decimals as u32);

        // Instruction to mint tokens to the associated token account
        let mint_to_ix = mint_to_checked(
            &TOKEN_PROGRAM_ID,                   // SPL Token program
            &self.mint_account.pubkey(),         // mint account
            &associated_token_account,           // recipient token account
            &self.authority_keypair.pubkey(),    // mint authority
            &[&self.authority_keypair.pubkey()], // signers
            amount_to_mint,                      // amount in smallest units
            mint_decimals,                       // decimals
        )?;

        // Build transaction with the mint instruction
        let mut transaction =
            Transaction::new_with_payer(&[mint_to_ix], Some(&self.authority_keypair.pubkey()));

        // Sign transaction with authority keypair
        transaction.sign(
            &[&self.authority_keypair],
            self.rpc_client.get_latest_blockhash().await?,
        );

        // Send transaction and wait for confirmation
        let transaction_signature = self
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(transaction_signature)
    }

    /// Transfers SPL tokens from the authority (sender) to a recipient.
    ///
    /// [How to Send Tokens](https://solana.com/developers/cookbook/tokens/transfer-tokens)
    ///
    /// # Arguments
    /// * `recipient_pubkey` - the public key of the recipient wallet
    /// * `amount` - the number of tokens to transfer (in human-readable units, e.g., 1 = 1 token)
    ///
    /// # Returns
    /// * `Signature` of the transfer transaction
    pub async fn send_tokens(&self, recipient_pubkey: &Pubkey, amount: u64) -> Result<Signature> {
        let sender = &self.authority_keypair; // authority and fee payer
        let mint_account = &self.mint_account; // token mint

        // Derive the associated token accounts (ATA) for sender and recipient
        let sender_token_account =
            get_associated_token_address(&sender.pubkey(), &mint_account.pubkey());
        let recipient_token_account =
            get_associated_token_address(&recipient_pubkey, &mint_account.pubkey());

        // Fetch the decimals of the mint (e.g., 9 for most SPL tokens)
        // Needed to convert human-readable `amount` into base units (lamports of the token)
        let decimals = self
            .rpc_client
            .get_token_account_balance(&sender_token_account)
            .await?
            .decimals;
        let transfer_amount = amount * 10_u64.pow(decimals as u32);

        let mut instructions = vec![];

        // Build optional instruction to create recipient ATA if it doesn't exist
        if self
            .rpc_client
            .get_account(&recipient_token_account)
            .await
            .is_err()
        {
            let create_recipient_ata_ix = create_associated_token_account_idempotent(
                &sender.pubkey(),       // payer
                &recipient_pubkey,      // wallet to hold tokens
                &mint_account.pubkey(), // mint
                &TOKEN_PROGRAM_ID,      // SPL token program
            );
            instructions.push(create_recipient_ata_ix);
        }

        // Build transfer instruction with decimal check for safety
        let transfer_ix = transfer_checked(
            &TOKEN_PROGRAM_ID,        // SPL token program
            &sender_token_account,    // source ATA
            &mint_account.pubkey(),   // token mint
            &recipient_token_account, // destination ATA
            &sender.pubkey(),         // authority of sender
            &[&sender.pubkey()],      // signer seeds
            transfer_amount,          // amount in base units
            decimals,                 // decimals to check
        )?;
        instructions.push(transfer_ix);

        // Build the transaction with the transfer instruction
        let mut transaction = Transaction::new_with_payer(&instructions, Some(&sender.pubkey()));

        // Sign with the sender's authority (who also pays for fees)
        transaction.sign(&[&sender], self.rpc_client.get_latest_blockhash().await?);

        // Send and confirm transaction
        let transaction_signature = self
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(transaction_signature)
    }
}
