use anyhow::Result;
use clap::{Parser, Subcommand};

mod create_mint;
mod request_airdrop;

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
}

pub async fn run(cli: Cli) -> Result<()> {
    match cli.command {
        Commands::RequestAirdrop { sol_amount, pubkey } => {
            request_airdrop::run(sol_amount, pubkey).await?;
        }
        Commands::CreateMint {} => {
            create_mint::run().await?;
        }
    }

    Ok(())
}
