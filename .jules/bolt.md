## 2026-05-01 - [Bootstrap Service Optimizations]
**Learning:** Sequential queries and nested loops in bootstrap endpoints (e.g. `getBootstrapData`) cause severe N+1 and cascading database fetch delays on client load. `Promise.all` is essential here.
**Action:** Always extract foreign keys mapping to deeply nested resources and query them concurrently with root objects using Prisma's `in` operator rather than querying within a loop.
