use crate::utils::solana_util;
use anyhow::{Result};
use mpl_token_metadata::{
    ID as TOKEN_METADATA_PROGRAM_ID,
    accounts::Metadata,
    instructions::CreateV1Builder,
    types::{PrintSupply, TokenStandard},
};
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_program::program_pack::Pack;
use solana_program::pubkey::Pubkey;
use solana_program::system_instruction::create_account;
use solana_sdk::{
    signature::{Keypair, Signature},
    signer::Signer,
    transaction::Transaction,
};
use spl_associated_token_account::get_associated_token_address;
use spl_associated_token_account::instruction::create_associated_token_account_idempotent;
use spl_token::instruction::mint_to_checked;
use spl_token::{ID as TOKEN_PROGRAM_ID, instruction::initialize_mint2, state::Mint};

pub struct NftApi {
    rpc_client: RpcClient,
    authority_keypair: Keypair,
}

impl NftApi {
    /// Create new API wrapper with RPC client + authority keypair
    pub fn new() -> Self {
        Self {
            rpc_client: solana_util::create_rpc_client(),
            authority_keypair: solana_util::get_authority_keypair(),
        }
    }

    /// Creates a new mint account and initializes it as an SPL mint
    pub async fn create_mint(&self) -> Result<(Keypair, Signature)> {
        let mint_keypair = Keypair::new();
        let mint_pubkey = mint_keypair.pubkey();

        let mint_account_len = Mint::LEN;
        let mint_account_rent = self
            .rpc_client
            .get_minimum_balance_for_rent_exemption(mint_account_len)
            .await?;

        // Create an account for the mint
        let create_mint_account_ix = create_account(
            &self.authority_keypair.pubkey(), // payer
            &mint_pubkey,                     // new mint account
            mint_account_rent,                // rent-exempt balance
            mint_account_len as u64,          // mint size
            &TOKEN_PROGRAM_ID,                // token program
        );

        // Initialize mint with decimals = 0
        let initialize_mint_ix = initialize_mint2(
            &TOKEN_PROGRAM_ID,                      // token program
            &mint_pubkey,                           // mint address
            &self.authority_keypair.pubkey(),       // mint authority
            Some(&self.authority_keypair.pubkey()), // freeze authority
            0,                                      // decimals = 0 for NFT
        )?;

        // Build and sign transaction
        let mut transaction = Transaction::new_with_payer(
            &[create_mint_account_ix, initialize_mint_ix],
            Some(&self.authority_keypair.pubkey()),
        );

        transaction.sign(
            &[&self.authority_keypair, &mint_keypair],
            self.rpc_client.get_latest_blockhash().await?,
        );

        // Send transaction
        let transaction_signature = self
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok((mint_keypair, transaction_signature))
    }

    /// Creates an associated token account (ATA) for given mint + user
    pub async fn create_token_account(
        &self,
        mint_pubkey: &Pubkey,
        recipient_pubkey: &Pubkey,
    ) -> Result<Signature> {

        // Create ATA if not exist
        let create_ata_ix = create_associated_token_account_idempotent(
            &self.authority_keypair.pubkey(), // payer
            &recipient_pubkey,                // wallet owner
            &mint_pubkey,                     // mint
            &TOKEN_PROGRAM_ID,                // token program
        );

        // Build and sign transaction
        let mut transaction =
            Transaction::new_with_payer(&[create_ata_ix], Some(&self.authority_keypair.pubkey()));

        transaction.sign(
            &[&self.authority_keypair],
            self.rpc_client.get_latest_blockhash().await?,
        );

        // Send transaction
        let transaction_signature = self
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(transaction_signature)
    }

    /// Mints 1 token (NFT) to the recipient's ATA
    pub async fn mint_token(
        &self,
        mint_keypair: &Keypair,
        recipient_pubkey: &Pubkey,
    ) -> Result<Signature> {

        // Find ATA for this mint + user
        let associated_token_account =
            get_associated_token_address(&recipient_pubkey, &mint_keypair.pubkey());

        // Mint 1 token to ATA
        let mint_to_ix = mint_to_checked(
            &TOKEN_PROGRAM_ID,                   // token program
            &mint_keypair.pubkey(),             // mint
            &associated_token_account,          // user's ATA
            &self.authority_keypair.pubkey(),   // mint authority
            &[&self.authority_keypair.pubkey(), &mint_keypair.pubkey()], // signers
            1,                                  // amount
            0,                                  // decimals
        )?;

        // Build and sign transaction
        let mut transaction =
            Transaction::new_with_payer(&[mint_to_ix], Some(&self.authority_keypair.pubkey()));

        transaction.sign(
            &[&self.authority_keypair, mint_keypair],
            self.rpc_client.get_latest_blockhash().await?,
        );

        // Send transaction
        let transaction_signature = self
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(transaction_signature)
    }

    /// Creates metadata + master edition for the mint (Metaplex NFT)
    pub async fn create_metadata(&self, mint_keypair: &Keypair) -> Result<Signature> {

        // PDA for metadata
        let (metadata_pubkey, _) = Metadata::find_pda(&mint_keypair.pubkey());

        // PDA for master edition
        let (master_edition_pda, _bump) = Pubkey::find_program_address(
            &[
                b"metadata",
                TOKEN_METADATA_PROGRAM_ID.as_ref(),
                mint_keypair.pubkey().as_ref(),
                b"edition",
            ],
            &TOKEN_METADATA_PROGRAM_ID,
        );

        // Build Metaplex create metadata instruction
        let create_ix = CreateV1Builder::new()
            .metadata(metadata_pubkey)                     // metadata PDA
            .mint(mint_keypair.pubkey(), true)            // mint + signer
            .authority(self.authority_keypair.pubkey())   // mint authority
            .payer(self.authority_keypair.pubkey())       // payer
            .update_authority(self.authority_keypair.pubkey(), true) // update authority
            .is_mutable(true)                             // allow updates
            .primary_sale_happened(false)                 // primary sale flag
            .name(solana_util::get_nft_name())            // NFT name
            .symbol(solana_util::get_nft_symbol())        // symbol
            .uri(solana_util::get_nft_meta_uri())         // metadata URI
            .seller_fee_basis_points(0)                   // royalties
            .token_standard(TokenStandard::NonFungible)    // NFT
            .print_supply(PrintSupply::Zero)               // no printing
            .master_edition(Some(master_edition_pda))      // master edition PDA
            .spl_token_program(Some(TOKEN_PROGRAM_ID))
            .instruction();

        // Build and sign transaction
        let mut transaction =
            Transaction::new_with_payer(&[create_ix], Some(&self.authority_keypair.pubkey()));

        transaction.sign(
            &[&self.authority_keypair, &mint_keypair], // both must sign
            self.rpc_client.get_latest_blockhash().await?,
        );

        // Send transaction
        let transaction_signature = self
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(transaction_signature)
    }

    /// Full workflow: mint NFT → create ATA → send NFT → create metadata
    pub async fn mint_nft_to_recipient(&self, recipient_pubkey: &Pubkey) -> Result<()> {

        // 1) Create mint
        let (mint_keypair, mint_signature) = self.create_mint().await?;
        println!(
            "✅ Mint: {}, Signature: {}",
            &mint_keypair.pubkey(),
            mint_signature
        );

        // 2) Create user's ATA
        let token_account_signature = self
            .create_token_account(&mint_keypair.pubkey(), &recipient_pubkey)
            .await?;
        println!("✅ Token Account, Signature: {}", token_account_signature);

        // 3) Mint 1 token to recipient
        let one_token_signature = self
            .mint_token(&mint_keypair, &recipient_pubkey)
            .await?;
        println!("✅ Token (NFT), Signature: {}", one_token_signature);

        // 4) Create metadata + master edition
        let metadata_signature = self.create_metadata(&mint_keypair).await?;
        println!("✅ Metadata, Signature: {}", metadata_signature);

        Ok(())
    }
}
