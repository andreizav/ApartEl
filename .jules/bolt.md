
## 2024-05-18 - Batch API Calls for Bulk Data Imports
**Learning:** Found an N+1 API request anti-pattern in the PnL import feature. Iterating over imported data and making individual HTTP `POST` requests for each row causes significant network overhead and SQLite disk sync overhead.
**Action:** Always use batch API endpoints (e.g., `createMany`) for bulk data imports to minimize network latency and database round-trips.
