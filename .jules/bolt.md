## 2024-05-15 - Optimize staff email lookups in Auth and Staff services
**Learning:** SQLite doesn't support case-insensitive lookups with `mode: 'insensitive'` in Prisma, which has led to O(N) application-side filtering where all staff records are fetched using `findMany()` and then filtered in memory using `.find(s => s.email.toLowerCase() === email.toLowerCase())`.
**Action:** Use `prisma.$queryRaw` with `LOWER(email) = LOWER($1)` to perform the lookup efficiently in the database rather than fetching all records.
