# 🧠 Solana Quiz

> **Solana Quiz** is a cutting-edge decentralized application (dApp) where users can take engaging daily quizzes and
> earn **Solana-based tokens** for correct answers.  
> The architecture is built around **Node.js**, **Rust**, **Kafka**, and the **Solana blockchain**, ensuring
> asynchronous event handling and transparent token rewards.  
> Each quiz is dynamically generated using **OpenAI**, ensuring fresh, interesting, and challenging questions every day.

### 🚀 Key Features

- **Daily AI-powered quizzes** - questions are generated with OpenAI and stored in the database for consistent access
  throughout the day.
- **Token rewards** - users earn **our own custom SPL token** for correct answers, minted and distributed via the Solana
  blockchain.
- **Transparent and decentralized** - blockchain ensures verifiable, tamper-proof rewards.
- **Seamless wallet integration** - currently supports **Phantom Wallet**, with the possibility to add other Solana
  wallets.

### 🌍 Use Cases

- **Corporate training & engagement** - motivate employees with fun quizzes and token rewards.
- **Educational platforms** - incentivize students to participate and learn through tokenized quizzes.
- **Community engagement** - create interactive dApps for crypto communities, rewarding participation with on-chain
  tokens.
- **Gamification & loyalty programs** - reward users with on-chain tokens for engagement, participation, or
  achievements.

---

## 🏗 Project Architecture

| Service               | Technologies                         | Description                                                                    |
|-----------------------|--------------------------------------|--------------------------------------------------------------------------------|
| **Frontend**          | Next.js, React, TailwindCSS          | User interface and wallet interaction                                          |
| **Backend (Node.js)** | Express, Prisma, KafkaJS, OpenAI API | REST API, quiz logic, question generation, authentication, Kafka communication |
| **Rust Service**      | Rust, Solana SDK, rdkafka            | Token minting and Solana transactions                                          |

All services are orchestrated via **Docker Compose** and communicate through **Kafka**.

---

## ⚙️ Tech Stack

- **Frontend:** Next.js 15, React 19, TailwindCSS 4
- **Backend:** Node.js, Express, Prisma ORM, KafkaJS, OpenAI API
- **Blockchain Layer:** Solana SDK, SPL Token, Metaplex Metadata
- **Worker:** Rust + Tokio + rdkafka
- **Database:** PostgreSQL
- **Infra:** Docker Compose, dotenv
- **Tools:** Prisma, ESLint, Prettier, TypeScript

---

## ⚡ How It Works

### 1️⃣ Authentication via Solana Wallet

Currently, only the Phantom Wallet is integrated for user authentication. However,
the codebase allows for easy extension to support other Solana-compatible wallets in the future.

<img src="https://raw.githubusercontent.com/di-zed/internal-storage/main/readme/images/solana-quiz/main.png" alt="Main" style="max-height: 500px"/>

Users connect their **Phantom Wallet** through the frontend.  
The Node.js service generates a signable message; the wallet signature confirms ownership of the address.  
Once verified, the backend creates or fetches a user in the database.

<img src="https://raw.githubusercontent.com/di-zed/internal-storage/main/readme/images/solana-quiz/main_logged_in.png" alt="Main Logged In" style="max-height: 500px"/>

### 2️⃣ Taking the Quiz

After login, users can take a quiz.  
The frontend interacts with the Node.js service via REST API to:

- Fetch questions
- Submit answers
- Get results

<img src="https://raw.githubusercontent.com/di-zed/internal-storage/main/readme/images/solana-quiz/quiz.png" alt="Quiz" style="max-height: 500px"/>

The Node.js service calculates the score and determines the reward.

<img src="https://raw.githubusercontent.com/di-zed/internal-storage/main/readme/images/solana-quiz/quiz_completed.png" alt="Quiz Completed" style="max-height: 500px"/>

### 3️⃣ Sending Reward Event to Kafka

Once the quiz is completed, Node.js publishes an event to Kafka topic:

```shell
Topic: solana-quiz-rewards
```

Example payload:

```json
{
  "user_id": 1,
  "user_wallet": "...",
  "quiz_id": "20251212",
  "total_questions": 5,
  "correct_answers": 5,
  "earned_tokens": 10,
  "streak_days": 7
}
```

### 4️⃣ Rust Service Processes Reward

This project integrates **Solana on-chain rewards** with an **off-chain Rust service** that distributes both **token rewards**
and **NFT rewards** based on user quiz streaks.

Reward behavior is controlled through environment variables:

- **SOLANA_ON_CHAIN** — enables or disables on-chain reward transfers.
- **SOLANA_STREAK_DAYS** — sets how many consecutive correct-answer days are required to mint an NFT reward.

### 🧩 Architecture overview

### Off-chain (Rust service)

The Rust service subscribes to the `solana-quiz-rewards` message queue topic.  
Upon receiving an event, it:

1. Validates the wallet address
2. Connects to the Solana RPC (`https://api.devnet.solana.com`)
3. Mints and transfers tokens to the user’s wallet

### On-chain (Anchor program)

The **Anchor program** (`solana_quiz_rewards`) manages the reward logic on **Solana Devnet**.

#### 1. Configure Solana CLI

```shell
cd /home/app/programs/solana_quiz_rewards
solana config set --url https://api.devnet.solana.com
solana config set --keypair ./../../secret/authority.json
solana config get
```

> Optional:
> ```shell
> export ANCHOR_WALLET=./../../secret/authority.json
> ```

#### 2. Update program identifiers

If deploying your **own instance**, generate a new keypair and update program IDs:

```shell
solana-keygen new --outfile ./target/deploy/solana_quiz_rewards-keypair.json
solana-keygen pubkey ./target/deploy/solana_quiz_rewards-keypair.json
```

Then update the generated public key in:

`src/lib.rs`

```rust
declare_id!("YOUR_NEW_PROGRAM_ID_HERE");
```

`Anchor.toml`

```toml
[programs.devnet]
solana_quiz_rewards = "YOUR_NEW_PROGRAM_ID_HERE"
```

> ⚠️ If you’re maintaining an existing deployed program — do **not** regenerate the keypair.  
> Just ensure the same ID is used across files.

#### 3. Build and deploy the program (if deploying your own instance)

```shell
anchor build
anchor deploy
```

#### 4. Copy IDL for backend/frontend integration

```shell
cd /home/app
cp ./programs/solana_quiz_rewards/target/idl/solana_quiz_rewards.json ./idls/
```

> 💡 Once deployed, the backend can use this IDL to interact with the on-chain program through Anchor’s client SDK.

### Reward Confirmation

<img src="https://raw.githubusercontent.com/di-zed/internal-storage/main/readme/images/solana-quiz/wallet.png" alt="Wallet" style="max-height: 500px"/>

After a successful transaction, Rust publishes confirmation to:

```shell
Topic: solana-quiz-reward-applied
```

Payload example:

```json
{
  "user_id": 1,
  "quiz_id": "20251212"
}
```

### 5️⃣ Node.js Acknowledges Reward

Node.js listens to `solana-quiz-reward-applied` and updates the database upon confirmation, marking the reward as
distributed.

<img src="https://raw.githubusercontent.com/di-zed/internal-storage/main/readme/images/solana-quiz/statistics.png" alt="Statistics" style="max-height: 500px"/>

### 6️⃣ NFT Reward for Streaks

If the user reaches the required number of consecutive correct-answer days (`SOLANA_STREAK_DAYS`), the system mints an
NFT reward and assigns it to the user.

<img src="https://raw.githubusercontent.com/di-zed/internal-storage/main/readme/images/solana-quiz/nft_list.png" alt="NFT List" style="max-height: 500px"/>

---

### 🔹 NFT Details

Users who achieve consecutive correct-answer streaks (`SOLANA_STREAK_DAYS`) receive **NFT rewards** minted on Solana.
These NFTs include metadata for display in wallets like Phantom.

- **Streak requirement:** `SOLANA_STREAK_DAYS` (set in `.env`).
- **NFT Metadata URI:** [metadata.json](https://raw.githubusercontent.com/di-zed/internal-storage/refs/heads/main/solana-quiz-nft/metadata.json).
- **Token Standard:** Metaplex Non-Fungible Token (NFT).
- **Attributes:** can include streak length, quiz type, timestamp, or rarity.
- **Where NFTs appear:** Wallets like Phantom or Solflare will display the NFT with image, name, and description.
- **How it works:** Minting is handled off-chain via the Rust service and triggered automatically when a user reaches the streak threshold.

<img src="https://raw.githubusercontent.com/di-zed/internal-storage/main/readme/images/solana-quiz/nft_details.png" alt="NFT Details" style="max-height: 500px"/>

---

## 📝 OpenAI Integration - Quiz Questions

Quiz questions are **fetched from OpenAI once per day** and stored in the database.
After that, all users take the quiz using the questions already stored for the day.
This ensures that every user sees the same set of questions during the day.

To generate quiz questions, you must have an OpenAI account and set your API key in .env.

```dotenv
# OpenAI API Key
OPEN_AI_API_KEY=your_openai_api_key_here
# OpenAI Model to use for generating questions
OPEN_AI_MODEL=gpt-4.1-nano
# Language for generated questions
OPEN_AI_LANGUAGE=English
```

> 💡 Tip: Make sure the .env file is properly updated before running the project.  
> The Node.js backend will use these settings to generate new questions daily.

---

## 📁 Project Structure

```
.
├── front/                  # Next.js frontend
├── node/                   # Node.js backend (Express + Prisma + Kafka)
├── rust/                   # Rust microservice (Solana integration)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚡ Quick Start

### 1️⃣ Clone and Prepare

```shell
git clone https://github.com/di-zed/solana-quiz.git
cd solana-quiz

cp .env.sample .env
# ✏️ Don’t forget to edit the .env file - update your keys, ports, wallet keypair paths, etc.

# 🐚 Terminal history setup:
cp volumes/root/bash_history/front.sample volumes/root/bash_history/front
cp volumes/root/bash_history/node.sample volumes/root/bash_history/node
cp volumes/root/bash_history/postgres.sample volumes/root/bash_history/postgres
cp volumes/root/bash_history/rust.sample volumes/root/bash_history/rust
```

### 2️⃣ Run via Docker

#### Development

```shell
cp docker-compose.local.sample.yml docker-compose.local.yml
make docker-local-restart
docker-compose exec rust /bin/bash
cargo run
```

#### Production

```shell
docker-compose up -d
docker-compose exec rust /bin/bash
cargo build --release
./target/release/solana_quiz
```

#### Database (Development & Production)

```shell
docker-compose exec node /bin/bash
npx prisma migrate deploy
npx prisma generate
```

| Service    | URL                   |
|------------|-----------------------|
| Frontend   | http://localhost      |
| Backend    | http://localhost:3000 |
| Kafka UI   | http://localhost:8081 |
| PostgreSQL | localhost:5432        |

---

## 📖 API Documentation (Swagger)

This document explains how to access and use the Swagger UI for the Solana Quiz backend API.

### Access Swagger UI

Once your backend service is running, Swagger UI is available at:

```shell
<NODE_PUBLIC_URL>/api # http://localhost:3000/api
```

### Testing Endpoints

Swagger allows you to test API endpoints directly in the browser:

1. Open Swagger UI.
2. Expand the endpoint you want to test.
3. Fill in request parameters or body data.
4. Click **Execute** to send the request.
5. Observe the response in the UI.

### Authentication

Some endpoints require a valid authentication token via cookies.

Cookie Name: `auth_token`

- **Using Swagger UI:** Click the **Authorize** button and enter your token to access protected endpoints.
- **Alternative:** You can log in through the frontend (the cookie will be set automatically) or reuse an existing `auth_token` cookie from your browser if already logged in.

### References

* Swagger UI: [https://swagger.io/tools/swagger-ui/](https://swagger.io/tools/swagger-ui/)

---

## 🔑 Solana Setup

### Generate Keys

```shell
# 🧱 Enter the Rust service container
docker-compose exec rust /bin/bash

solana-keygen new --outfile ./secret/authority.json
solana-keygen new --outfile ./secret/mint.json
```

### Get Public Keys

```shell
solana-keygen pubkey ./secret/authority.json
solana-keygen pubkey ./secret/mint.json
```

### Airdrop SOL

```shell
solana airdrop 5 $(solana-keygen pubkey ./secret/authority.json) --url https://api.devnet.solana.com
```

---

## ⚙️ Rust CLI Commands

This section guides you through creating your own SPL token on Solana.
You’ll mint 1,000,000 tokens to your authority wallet account - this will act as the “bank” from which tokens can later
be distributed to users.
You’ll also set up metadata for the token (name, symbol, and icon/description), so it appears properly in Solana
explorers and wallets.

👉 Example metadata
file: [metadata.json](https://raw.githubusercontent.com/di-zed/internal-storage/refs/heads/main/solana-quiz-token/metadata.json)

> ⚠️ Before running these commands, make sure your .env file is properly configured.  
> It must include wallet keypair paths, network, and metadata settings as shown below.

```shell
# 🏗 Build Rust service binary
# This will produce ./target/release/solana
docker-compose exec rust /bin/bash
cargo build --release

# ⚙️ Make sure the following environment variables are set in .env:
# (they define wallet keypairs, network, and metadata for your token)
#
# SOLANA_NETWORK=devnet
# SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
# SOLANA_AUTHORITY_KEYPAIR_PATH=./secret/authority.json
# SOLANA_MINT_KEYPAIR_PATH=./secret/mint.json
# SOLANA_TOKEN_NAME="Solana Quiz Token"
# SOLANA_TOKEN_SYMBOL="SQT"
# SOLANA_TOKEN_METADATA_URI="https://raw.githubusercontent.com/di-zed/internal-storage/refs/heads/main/solana-quiz-token/metadata.json"

# 💧 Request 5 SOL from Solana Devnet
# By default, SOL is airdropped to the authority wallet (defined in SOLANA_AUTHORITY_KEYPAIR_PATH).
# Optionally, you can specify a different public key using the --pubkey flag:
# ./target/release/solana request-airdrop --sol-amount 5 --pubkey <WALLET_ADDRESS>
./target/release/solana request-airdrop --sol-amount 5

# 🪙 Create a new SPL token mint
# Uses the authority and mint keypairs defined in .env
./target/release/solana create-mint

# 💼 Create an associated token account for the authority wallet
# This is where minted tokens will be stored
./target/release/solana create-token-account

# 🏭 Mint 1,000,000 tokens to the authority’s token account
./target/release/solana mint-tokens --amount 1000000

# 💸 Send 5 tokens to a specific wallet address (replace <WALLET_ADDRESS> with the real address)
./target/release/solana send-tokens --recipient <WALLET_ADDRESS> --amount 5

# 📝 Create token metadata accounts on Solana
# Metadata includes name, symbol, and metadata URI (set in SOLANA_TOKEN_METADATA_URI)
./target/release/solana create-metadata-accounts
```

---

## 🧾 Solana Direct Checks

```shell
solana account <WALLET_ADDRESS> --url https://api.devnet.solana.com
solana balance <WALLET_ADDRESS> --url https://api.devnet.solana.com
solana logs --url https://api.devnet.solana.com
```

---

## 🧩 Database Management

### Development (creating and applying migrations)

> These commands are only needed if you are developing or updating the database schema.
> For normal project usage, you can skip migration commands.

```shell
# Enter the Node.js container
docker-compose exec node /bin/bash

# Create a new migration and apply it to the development database
npx prisma migrate dev --name <migration_name>
```

### Production Deployment

```shell
# Apply already created migrations in production
npx prisma migrate deploy
```

---

## 🧵 Kafka Topics

| Topic                        | Producer | Consumer | Purpose                      |
|------------------------------|----------|----------|------------------------------|
| `solana-quiz-rewards`        | Node.js  | Rust     | Event when quiz is completed |
| `solana-quiz-reward-applied` | Rust     | Node.js  | Confirmation of token reward |

### Get CLUSTER_ID

```shell
docker-compose run kafka1 /bin/bash
kafka-storage random-uuid
```

---

## 🧰 Useful Commands

| Action                 | Command                    |
|------------------------|----------------------------|
| Check Solana balance   | `solana balance <address>` |
| Rebuild Rust binary    | `cargo build --release`    |
| Validate Prisma schema | `npx prisma validate`      |
| Open Kafka UI          | http://localhost:8081      |

---

## 🧹 Cleanup

```shell
docker-compose down -v
docker system prune -f
```

---

## 🧭 Repository

[https://github.com/di-zed/solana-quiz](https://github.com/di-zed/solana-quiz)

---

## 🪪 License

**MIT License** - Free to use, modify, and distribute.  
⚠️ Attribution required: include a link to the original repository -  
[https://github.com/di-zed/solana-quiz](https://github.com/di-zed/solana-quiz)

---

## 🧭 Roadmap

- [x] Integrate on-chain Solana programs for automated token
- [x] NFT rewards for quiz streaks (reward users with unique NFTs for consecutive correct answers)
- [ ] Migrate to Solana mainnet-beta

---

⭐ If you find this project useful, consider giving it a star - it helps others discover it.  
Moreover, every star helps me stay motivated.  
Thanks for the support!

---

## ✨ Authors

**DiZed Team**  
GitHub: [@di-zed](https://github.com/di-zed)