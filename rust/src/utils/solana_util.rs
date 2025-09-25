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

/// Creates a new RPC client using the endpoint from the environment variable.
pub fn create_rpc_client() -> RpcClient {
    let rpc = config_util::get_required_env("SOLANA_RPC_ENDPOINT")
        .expect("SOLANA_RPC_ENDPOINT is not set");

    RpcClient::new_with_commitment(rpc, CommitmentConfig::confirmed())
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
