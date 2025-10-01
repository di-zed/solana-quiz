use anyhow::Result;
use clap::{Parser, Subcommand};

mod create_metadata_accounts;
mod create_mint;
mod create_token_account;
mod mint_tokens;
mod request_airdrop;
mod send_tokens;

#[derive(Parser)]
#[command(name = "solana-quiz")]
#[command(about = "Solana Quiz CLI", long_about = None)]
pub struct Cli {
    #[clap(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    RequestAirdrop {
        #[arg(short, long)]
        sol_amount: u64,
        #[arg(short, long)]
        pubkey: Option<String>,
    },
    CreateMint {},
    CreateTokenAccount {},
    MintTokens {
        #[arg(short, long)]
        amount: u64,
    },
    SendTokens {
        #[arg(short, long)]
        recipient: String,
        #[arg(short, long)]
        amount: u64,
    },
    CreateMetadataAccounts {},
}

/// Runs the CLI application by parsing the user command and executing
/// the corresponding async handler.
pub async fn run() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::RequestAirdrop { sol_amount, pubkey } => {
            request_airdrop::run(sol_amount, pubkey).await?;
        }
        Commands::CreateMint {} => {
            create_mint::run().await?;
        }
        Commands::CreateTokenAccount {} => {
            create_token_account::run().await?;
        }
        Commands::MintTokens { amount } => {
            mint_tokens::run(amount).await?;
        }
        Commands::SendTokens { recipient, amount } => {
            send_tokens::run(recipient, amount).await?;
        }
        Commands::CreateMetadataAccounts {} => {
            create_metadata_accounts::run().await?;
        }
    }

    Ok(())
}
