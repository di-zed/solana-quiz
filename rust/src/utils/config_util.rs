use anyhow::{Result, bail};
use std::env;

/// Gets a required environment variable or returns an error if missing/empty.
///
/// # Arguments
/// * `var` - name of the environment variable
///
/// # Returns
/// * `String` value of the environment variable
pub fn get_required_env(var: &str) -> Result<String> {
    match env::var(var) {
        Ok(val) if !val.trim().is_empty() => Ok(val),
        Ok(_) => bail!("Environment variable {var} is set but empty"),
        Err(_) => bail!("Environment variable {var} is missing"),
    }
}
