## 2024-05-31 - [Optimize backend BootstrapService with Promise.all and batching]
**Learning:** Sequential DB awaits in Prisma across different base models combined with internal relation N+1 fetch loops creates large response latencies.
**Action:** Consolidate independent Prisma operations in NestJS init phases into a single `Promise.all` and utilize `.flatMap` with `in:` queries for batch relational fetching.
