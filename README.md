# solana-quiz

solana-keygen new --outfile ./secret/authority.json
solana-keygen new --outfile ./secret/mint.json

solana-test-validator

cargo build --release
./target/release/solana-quiz-cli request-airdrop --sol_amount 5
./target/release/solana-quiz create-mint