use anyhow::Result;
use clap::Parser;
use dotenv::dotenv;

mod commands;
mod utils;

fn main() -> Result<()> {
    // Load environment variables from `.env` file into std::env
    dotenv().ok();

    let cli = commands::Cli::parse();
    commands::run(cli)
}
