## 2025-02-14 - Prisma SQLite Case-Insensitive Lookup
**Learning:** Prisma on SQLite lacks native case-insensitive filtering. A common anti-pattern is fetching ALL records (`findMany()`) and filtering in JavaScript, which is O(N) and disastrous for performance.
**Action:** Use `prisma.$queryRaw` with `LOWER(col) = LOWER($val) LIMIT 1` to get the ID, then `findUnique` to fetch the record. This avoids transferring the whole table.
