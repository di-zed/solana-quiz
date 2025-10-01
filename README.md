# solana-quiz

solana-keygen new --outfile ./secret/authority.json
solana-keygen new --outfile ./secret/mint.json

Получить pubkey
solana-keygen pubkey ./secret/authority.json
solana-keygen pubkey ./secret/mint.json

solana-test-validator

cargo run --bin solana -- request-airdrop --sol-amount 5
...

cargo build --release
./target/release/solana request-airdrop --sol-amount 5
./target/release/solana create-mint
./target/release/solana create-token-account
./target/release/solana mint-tokens --amount 1000000
./target/release/solana send-tokens --recipient FzCptggk4znyovWcedjDD75E8ZXSJNWxiBfn1WDJ6FQ5 --amount 5
./target/release/solana create-metadata-accounts

solana account 48TLwzYY1k2xNWBzAXWLmbTHVoMe5SGoux3zwNHH3MkY --url http://host.docker.internal:8899
solana balance 48TLwzYY1k2xNWBzAXWLmbTHVoMe5SGoux3zwNHH3MkY --url http://host.docker.internal:8899
solana logs --url http://host.docker.internal:8899

Синхронизация схемы с базой (создание миграции)
npx prisma migrate dev --name init
--name init — название миграции (можешь любое).
Этот шаг создаст миграцию и применит её к базе.

Для production используют:
npx prisma migrate deploy
Он не создаёт новые миграции, а применяет только те, что уже были созданные в dev.
Предназначен для безопасного обновления базы на продакшене.

Kafka. Как получить CLUSTER_ID
docker-compose run kafka1 /bin/bash
kafka-storage random-uuid