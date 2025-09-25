# solana-quiz

solana-keygen new --outfile ./secret/authority.json
solana-keygen new --outfile ./secret/mint.json

Получить pubkey
solana-keygen pubkey ./secret/authority.json
solana-keygen pubkey ./secret/mint.json

solana-test-validator

cargo run -- request-airdrop --sol-amount 5
...

cargo build --release
./target/release/solana-quiz request-airdrop --sol-amount 5
./target/release/solana-quiz create-mint
./target/release/solana-quiz create-token-account
./target/release/solana-quiz mint-tokens --amount 1000000
./target/release/solana-quiz send-tokens --recipient FzCptggk4znyovWcedjDD75E8ZXSJNWxiBfn1WDJ6FQ5 --amount 5
./target/release/solana-quiz create-metadata-accounts

solana account 48TLwzYY1k2xNWBzAXWLmbTHVoMe5SGoux3zwNHH3MkY --url http://host.docker.internal:8899
solana balance 48TLwzYY1k2xNWBzAXWLmbTHVoMe5SGoux3zwNHH3MkY --url http://host.docker.internal:8899
solana logs --url http://host.docker.internal:8899