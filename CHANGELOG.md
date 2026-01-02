# CHANGE LOG

## [1.4.0] - 2026-01-02

### Added

- **Monitoring & Metrics:** Added Prometheus metrics for Node.js and HTTP requests.
- **Alerting (Alertmanager):**
  - High CPU usage (>80%)
  - High Memory usage (>80%)
  - Event Loop lag >50ms (p99)
  - Slow HTTP requests (P95 >3s)
- **Visualization (Grafana):** Dashboards created for CPU, memory, event loop lag, and HTTP latency.
- **Local access URLs and ports:**
  - Prometheus: http://localhost:9090 (host port 9090)
  - Alertmanager: http://localhost:9393 (host port 9393)
  - Grafana: http://localhost:3001 (host port 3001)

## [1.3.1] - 2025-12-16

### Added

- **Middleware:** Added `RequestIdMiddleware` to generate unique request IDs for all incoming HTTP requests.
- **Interceptor:** Added `ExecutionTimeInterceptor` to log slow requests (taking more than 3 seconds).

## [1.3.0] - 2025-12-10

### Changed

- Node.js backend migrated to **NestJS** for improved structure and scalability.

### Added

- Added **Swagger UI** for interactive API documentation and testing.

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