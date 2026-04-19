## 2024-05-15 - Case-insensitive email lookup in SQLite with Prisma
**Learning:** For case-insensitive lookups in SQLite with Prisma (e.g., email), use `prisma.$queryRaw` with `LOWER(column) = LOWER($val)` to fetch the `id`, then use `findUnique` instead of fetching all records, to avoid O(N) application-side filtering.
**Action:** Replace `findMany()` followed by `.find(s => s.email.toLowerCase() === email.toLowerCase())` with a `$queryRaw` lookup to find the ID and a subsequent `findUnique` to retrieve the fully typed object.
