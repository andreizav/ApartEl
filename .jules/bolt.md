## 2026-06-07 - Optimizing getBootstrapData
**Learning:** Sequential await statements for independent queries in the backend create a measurable performance bottleneck due to database round-trip times. Nested loops that perform queries (N+1 problem) are especially impactful on SQLite with Prisma.
**Action:** When fetching initial data or bootstrapping, identify independent queries and wrap them in `Promise.all()`. Use `.flatMap()` to extract IDs and Prisma's `in` operator to batch fetch nested relations, replacing N+1 query loops.
