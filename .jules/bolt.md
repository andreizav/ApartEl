## 2023-10-25 - Prevent N+1 queries during initial data bootstrap
**Learning:** In the NestJS architecture, using Prisma within nested loops (e.g. iterating over portfolio groups and units) to fetch related data significantly increases database round-trips and severely impacts initial bootstrap performance.
**Action:** Always collect nested IDs using `flatMap`/`map` arrays, and execute a single batch query using Prisma's `in` operator combined with `Promise.all` to fetch parallel dependencies.
