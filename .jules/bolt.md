## 2024-07-04 - Optimize Initialization Path
**Learning:** Sequential await statements and N+1 queries inside loops during initial data fetch (`BootstrapService.getBootstrapData`) significantly bottleneck startup. Prisma safely handles empty arrays for the `in` operator, allowing unconditional bulk-querying.
**Action:** Always group independent queries with `Promise.all` and replace nested loop queries with `flatMap` + `in` batching.
