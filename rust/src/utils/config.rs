use anyhow::{Result, bail};
use std::env;

pub fn get_required_env(var: &str) -> Result<String> {
    match env::var(var) {
        Ok(val) if !val.trim().is_empty() => Ok(val),
        Ok(_) => bail!("Environment variable {var} is set but empty"),
        Err(_) => bail!("Environment variable {var} is missing"),
    }
}
