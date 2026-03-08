## 2026-03-08 - Optimize Case-Insensitive Email Lookups in SQLite
**Learning:** SQLite doesn't natively support case-insensitive lookups via Prisma's `mode: 'insensitive'`. Previous implementation fetched all staff members via `findMany()` and filtered them in memory using `toLowerCase()`, which scales poorly (O(N) operation and large data transfer).
**Action:** Use `prisma.$queryRaw` with `LOWER(email) = LOWER($1)` to perform the filtering at the database level, preventing O(N) application-side filtering.
