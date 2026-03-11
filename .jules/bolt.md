
## 2025-03-09 - SQLite Case-Insensitive Search Bottleneck
**Learning:** SQLite with Prisma doesn't support the `mode: 'insensitive'` flag. Doing `findMany()` then filtering in memory with `.toLowerCase()` causes an O(N) application bottleneck as the database grows, retrieving all records across the network unnecessarily.
**Action:** Replace `findMany()` in-memory filters with `prisma.$queryRaw` using `LOWER(column) = LOWER($val) LIMIT 1` combined with a database index (`@@index([column])`). Ensure raw integer outputs for booleans (SQLite limitation) are manually cast back to JS booleans.
