use anyhow::Result;
use clap::{Parser, Subcommand};

mod create_mint;

#[derive(Parser)]
#[command(name = "solana-quiz")]
#[command(about = "Solana Quiz CLI", long_about = None)]
pub struct Cli {
    #[clap(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    CreateMint {},
}

pub fn run (cli: Cli) -> Result<()> {
    match cli.command {
        Commands::CreateMint {} => {
            create_mint::run()?;
        }
    }

    Ok(())
}
