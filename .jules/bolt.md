## 2025-07-03 - [Optimize Data Fetching with concurrent promises and batching in BootstrapService]
**Learning:** Sequential Prisma queries and N+1 query patterns in loops during critical initialization paths (`getBootstrapData`) introduce heavy latency overhead.
**Action:** Always fetch independent root entities using `Promise.all` and resolve nested lookups by extracting arrays of IDs (`flatMap`) to execute batch queries with the `in` operator.
