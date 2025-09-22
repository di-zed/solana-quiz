use anyhow::Result;
use crate::utils::config;

pub fn run() -> Result<()> {
    let rpc = config::get_required_env("SOLANA_RPC_ENDPOINT")?;
    let authority_keypair_path = config::get_required_env("SOLANA_AUTHORITY_KEYPAIR_PATH")?;
    let mint_keypair_path = config::get_required_env("SOLANA_MINT_KEYPAIR_PATH")?;

    println!("create_mint");
    println!("rpc: {}, authority_keypair_path: {}, mint_keypair_path: {}", rpc, authority_keypair_path, mint_keypair_path);

    Ok(())
}
