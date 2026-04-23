## 2024-05-20 - [Bootstrap Data Fetch Optimization]
**Learning:** `BootstrapService.getBootstrapData` was a critical performance bottleneck because it fetched the entire initial payload using sequential database queries and contained a nested N+1 issue for fetching channel mappings and ical connections per unit.
**Action:** When creating composite payloads that fetch multiple root entities, use `Promise.all` to fetch them concurrently. Use array methods like `flatMap` to gather IDs and make bulk queries using the `in` operator to avoid N+1 issues in loops.
