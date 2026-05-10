## 2024-05-10 - [Batch queries inside loops]
**Learning:** In Prisma + SQLite, making queries inside a loop is incredibly slow due to DB round-trips. Grouping them via `.flatMap` and using `Promise.all` alongside `where: { in: [...] }` allows solving the N+1 problem gracefully.
**Action:** Always batch queries with `in: []` instead of executing sequentially in loops. Prisma gracefully handles `in: []` when an empty array is passed.
