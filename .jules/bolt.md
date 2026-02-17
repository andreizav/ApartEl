## 2026-02-17 - Missing Database Indexes
**Learning:** The backend database (SQLite) does not automatically index foreign keys, and Prisma schemas often lack composite indexes for frequent query patterns (e.g., overlap checks, sorted lists).
**Action:** Always verify `prisma/schema.prisma` for missing indexes on foreign keys and frequently filtered/sorted columns. Add composite indexes for range queries (e.g., dates) and multi-column filters.
