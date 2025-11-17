# CHANGE LOG

## [1.2.0] - 2025-11-17

### Added

- Implemented off-chain streak tracking logic (daily streak counter with validation).
- Added NFT reward distribution for reaching specific streak milestones.

### Added

- Support for sending tokens **on-chain** via Solana.
- Persist user quiz history in the blockchain.
- Configurable streak length via `.env`:
  - `SOLANA_ON_CHAIN=true` — enable on-chain rewards.
  - `SOLANA_STREAK_DAYS=7` — set the number of days required for a streak.

## [1.1.0] - 2025-11-02

### Added

- Support for sending tokens **on-chain** via Solana.
- Persist user quiz history in the blockchain.
- Configurable streak length via `.env`:
    - `SOLANA_ON_CHAIN=true` — enable on-chain rewards.
    - `SOLANA_STREAK_DAYS=7` — set the number of days required for a streak.

## [1.0.0] - 2025-10-12

### Added

- Initial stable release.