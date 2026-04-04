
## 2026-04-04 - [Prisma N+1 Optimization with $transaction]
**Learning:** Using sequential `await` within `for...of` loops for Prisma database updates/creates causes N+1 query bottlenecks and slows down syncing.
**Action:** Always batch array-based heterogeneous Prisma operations (like `.upsert()`, `.update()`, and `.create()`) by mapping the array to Promises and wrapping them in `await this.prisma.$transaction(promises)`. This turns O(N) database round-trips into a single transaction, significantly reducing latency and improving bulk sync operations.
