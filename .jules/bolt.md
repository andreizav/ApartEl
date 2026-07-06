## 2026-07-06 - Optimizing Bootstrap Data Fetching
**Learning:** Sequential awaits for independent root entities and nested loop database queries (N+1) during the initial `getBootstrapData` fetch are significant performance bottlenecks in the backend.
**Action:** Always fetch multiple independent root entities concurrently using `Promise.all`. To resolve nested N+1 query issues, avoid querying inside loops; instead, collect IDs using array methods like `flatMap` and perform a single batched query using the `in` operator.
