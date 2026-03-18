## 2024-05-24 - Batching Transaction Insertions in Prisma
**Learning:** Performing multiple independent database inserts inside a loop (N+1 inserts) causes performance bottlenecks. It increases network latency, SQLite disk synchronization overhead, and database round-trips.
**Action:** When creating multiple records programmatically, use an array to store promises of inserts (or `createMany`) and use `prisma.$transaction(promises)` to perform them in a batch. Also, properly append loop indices to IDs created by `Date.now()` to prevent ID collision in tight loops.
