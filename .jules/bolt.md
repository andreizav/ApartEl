
## 2024-05-15 - Case-insensitive DB Lookups with SQLite
**Learning:** SQLite doesn't support Prisma's case-insensitive filtering mode out-of-the-box (`mode: 'insensitive'`). Previous implementation retrieved all `Staff` rows with `findMany` into memory to do `array.find(email.toLowerCase())`, causing an O(N) application bottleneck and memory issue as staff count grows.
**Action:** Use `$queryRaw` to do case-insensitive lookups directly in the DB: `SELECT * FROM Table WHERE LOWER(column) = LOWER($1)`. Always remember to parse boolean integer values from `$queryRaw` back to javascript booleans.
