use crate::utils::solana_util;
use anchor_client::Client;
use anchor_lang::declare_program;
use anchor_spl::associated_token::get_associated_token_address;
use anyhow::Result;
use solana_program::pubkey::Pubkey;
use solana_program::system_program;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::signature::{Keypair, Signer};
use std::rc::Rc;

declare_program!(solana_quiz_rewards);
use crate::utils::solana_util::get_solana_on_chain_streak_days;
use solana_quiz_rewards::{accounts::QuizUserData, client::accounts, client::args};

pub struct BlockchainApi {
    rpc_endpoint: String,       // RPC endpoint URL
    authority_keypair: Keypair, // Keypair of the payer/authority
    mint_account: Keypair,      // Mint account keypair for token transfers
}

impl BlockchainApi {
    /// Creates a new instance using environment variables
    pub fn new() -> Self {
        let rpc_endpoint = solana_util::get_rpc_endpoint();
        let authority_keypair = solana_util::get_authority_keypair();
        let mint_account = solana_util::get_mint_account();

        Self {
            rpc_endpoint,
            authority_keypair,
            mint_account,
        }
    }

    /// Creates a new instance with custom parameters (useful for testing)
    pub fn _with_params(
        rpc_endpoint: String,
        authority_keypair: Keypair,
        mint_account: Keypair,
    ) -> Self {
        Self {
            rpc_endpoint,
            authority_keypair,
            mint_account,
        }
    }

    /// Calls the quiz rewards program for a specific user
    pub async fn call_program_rewards(
        &self,
        user_pubkey: &Pubkey,
        total_questions: u64,
        correct_answers: u64,
        earned_tokens: u64,
    ) -> Result<()> {
        // Wrap authority keypair in Rc to share ownership
        let payer_rc = Rc::new(&self.authority_keypair);

        // Create Anchor client provider
        let provider = Client::new_with_options(
            self.rpc_endpoint.parse()?,
            payer_rc.clone(),
            CommitmentConfig::confirmed(),
        );

        let program_id = solana_quiz_rewards::ID;
        let program = provider.program(program_id)?;

        // Derive the user's PDA for quiz data
        let user_seeds = &[b"user_data_v2", user_pubkey.as_ref()];
        let (quiz_user_pda, bump) = Pubkey::find_program_address(user_seeds, &program_id);

        // Mint and associated token addresses
        let mint_pubkey: Pubkey = self.mint_account.pubkey();
        let sender_ata = get_associated_token_address(&payer_rc.pubkey(), &mint_pubkey);
        let recipient_ata = get_associated_token_address(&user_pubkey, &mint_pubkey);

        // Log start of transaction
        println!("\nSend transaction with initialize, update, transfer instructions");

        // Build initialize instruction
        let initialize_instructions = program
            .request()
            .accounts(accounts::Initialize {
                payer: payer_rc.pubkey(),
                user: *user_pubkey, // Dereference Pubkey reference
                quiz_user_data: quiz_user_pda,
                system_program: system_program::ID,
            })
            .args(args::Initialize)
            .instructions()?;

        // Build update quiz results instruction
        let update_instructions = program
            .request()
            .accounts(accounts::UpdateQuizResults {
                user: *user_pubkey,
                quiz_user_data: quiz_user_pda,
            })
            .args(args::UpdateQuizResults {
                total_questions,
                correct_answers,
                earned_tokens,
                streak_days: get_solana_on_chain_streak_days(),
            })
            .instructions()?;

        // Build token transfer instruction
        let transfer_instructions = program
            .request()
            .accounts(accounts::TransferTokens {
                signer: payer_rc.pubkey().into(),
                mint: mint_pubkey.into(),
                sender_token_account: sender_ata.into(),
                recipient_token_account: recipient_ata.into(),
                token_program: anchor_spl::token::ID,
            })
            .args(args::TransferTokens {
                amount: earned_tokens,
            })
            .instructions()?;

        // Combine instructions into a single transaction
        let mut request = program.request().signer(payer_rc.as_ref());

        for ix in initialize_instructions {
            request = request.instruction(ix);
        }
        for ix in update_instructions {
            request = request.instruction(ix);
        }
        for ix in transfer_instructions {
            request = request.instruction(ix);
        }

        // Send transaction
        let signature = request.send().await?;
        println!("   Transaction confirmed: {}", signature);

        // Fetch and display user quiz account data
        println!("\nFetch quiz user account data");
        let quiz_user_data_account: QuizUserData = program.account(quiz_user_pda).await?;
        println!("   Value: {:?}", quiz_user_data_account);

        Ok(())
    }
}
