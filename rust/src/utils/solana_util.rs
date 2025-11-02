use crate::utils::config_util;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::signature::{Keypair, read_keypair_file};

/// Reads a keypair from a file at the given path.
pub fn read_keypair(path: &str) -> Keypair {
    read_keypair_file(path).expect(&format!("Failed to read keypair at {}", path))
}

/// Returns the authority keypair from the environment variable.
pub fn get_authority_keypair() -> Keypair {
    let authority_keypair_path = config_util::get_required_env("SOLANA_AUTHORITY_KEYPAIR_PATH")
        .expect("SOLANA_AUTHORITY_KEYPAIR_PATH is not set");

    read_keypair(&authority_keypair_path)
}

/// Returns the mint account keypair from the environment variable.
pub fn get_mint_account() -> Keypair {
    let mint_keypair_path = config_util::get_required_env("SOLANA_MINT_KEYPAIR_PATH")
        .expect("SOLANA_MINT_KEYPAIR_PATH is not set");

    read_keypair(&mint_keypair_path)
}

/// Reads the RPC Endpoint from `SOLANA_RPC_ENDPOINT` env variable.
pub fn get_rpc_endpoint() -> String {
    config_util::get_required_env("SOLANA_RPC_ENDPOINT").expect("SOLANA_RPC_ENDPOINT is not set")
}

/// Creates a new RPC client using the endpoint from the environment variable.
pub fn create_rpc_client() -> RpcClient {
    RpcClient::new_with_commitment(get_rpc_endpoint(), CommitmentConfig::confirmed())
}

/// Reads the token name from `SOLANA_TOKEN_NAME` env variable.
pub fn get_token_name() -> String {
    config_util::get_required_env("SOLANA_TOKEN_NAME").expect("SOLANA_TOKEN_NAME is not set")
}

/// Reads the token symbol from `SOLANA_TOKEN_SYMBOL` env variable.
pub fn get_token_symbol() -> String {
    config_util::get_required_env("SOLANA_TOKEN_SYMBOL").expect("SOLANA_TOKEN_SYMBOL is not set")
}

/// Reads the metadata URI (JSON with image and description)
/// from `SOLANA_TOKEN_METADATA_URI` env variable.
pub fn get_token_meta_uri() -> String {
    config_util::get_required_env("SOLANA_TOKEN_METADATA_URI")
        .expect("SOLANA_TOKEN_METADATA_URI is not set")
}

/// Reads the `SOLANA_ON_CHAIN` environment variable and returns whether
/// token rewards should be sent via on-chain Solana transactions.
pub fn get_solana_on_chain() -> bool {
    let value =
        config_util::get_required_env("SOLANA_ON_CHAIN").expect("SOLANA_ON_CHAIN is not set");
    value == "true" || value == "1"
}

pub fn get_solana_on_chain_streak_days() -> u8 {
    let value = config_util::get_required_env("SOLANA_ON_CHAIN_STREAK_DAYS")
        .expect("SOLANA_ON_CHAIN_STREAK_DAYS is not set");

    value
        .parse::<u8>()
        .expect("SOLANA_ON_CHAIN_STREAK_DAYS must be a valid number")
}
